use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    http::{header, Method, StatusCode},
    response::{IntoResponse, Json},
    routing::get,
    Router,

};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FocusState {
    pub is_running: bool,
    pub is_paused: bool,
    pub selected_tag_id: String,
    pub selected_tag_name: String,
    pub selected_tag_color: String,
    pub elapsed_seconds: u32,
    pub mode: String,
    pub blocking_enabled: bool,
    pub blocking_mode: String, // "unlock_on_timer" | "block_on_timer"
    pub blocked_domains: Vec<String>,
    pub unlocked_until: Option<u64>,
    #[serde(default)]
    pub active_site_stopwatches: std::collections::HashMap<String, u64>,
    pub last_updated: u64,
}

impl Default for FocusState {
    fn default() -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            is_running: false,
            is_paused: false,
            selected_tag_id: "tag-coding".to_string(),
            selected_tag_name: "Coding".to_string(),
            selected_tag_color: "#58CC02".to_string(),
            elapsed_seconds: 0,
            mode: "stopwatch".to_string(),
            blocking_enabled: true,
            blocking_mode: "unlock_on_timer".to_string(),
            blocked_domains: vec![
                "youtube.com".to_string(),
                "twitter.com".to_string(),
                "x.com".to_string(),
                "reddit.com".to_string(),
                "instagram.com".to_string(),
                "facebook.com".to_string(),
                "tiktok.com".to_string(),
                "twitch.tv".to_string(),
                "netflix.com".to_string(),
                "hulu.com".to_string(),
                "disneyplus.com".to_string(),
            ],
            unlocked_until: None,
            active_site_stopwatches: std::collections::HashMap::new(),
            last_updated: now,
        }
    }
}



#[derive(Clone)]
pub struct AppState {
    pub focus: Arc<RwLock<FocusState>>,
    pub tx: broadcast::Sender<FocusState>,
}

pub fn start_local_server(focus_state: Arc<RwLock<FocusState>>, tx: broadcast::Sender<FocusState>) {
    let app_state = AppState {
        focus: focus_state,
        tx,
    };

    std::thread::spawn(move || {
        let rt = match tokio::runtime::Builder::new_multi_thread()
            .worker_threads(2)
            .enable_all()
            .build()
        {
            Ok(rt) => rt,
            Err(e) => {
                eprintln!("[Jarvis Server] Failed to build Tokio runtime: {}", e);
                return;
            }
        };

        rt.block_on(async move {
            let cors = CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
                .allow_headers([header::CONTENT_TYPE, header::ACCEPT, header::AUTHORIZATION]);

            let app = Router::new()
                .route("/status", get(get_status_handler))
                .route("/health", get(health_check_handler))
                .route("/ws", get(ws_handler))
                .layer(cors)
                .with_state(app_state);

            let addr = SocketAddr::from(([127, 0, 0, 1], 43210));
            println!("[Jarvis Server] Starting Focus Bridge server at http://{}", addr);

            let listener = match tokio::net::TcpListener::bind(addr).await {
                Ok(l) => l,
                Err(err) => {
                    eprintln!("[Jarvis Server] Failed to bind to {}: {}", addr, err);
                    return;
                }
            };

            if let Err(err) = axum::serve(listener, app).await {
                eprintln!("[Jarvis Server] Axum server error: {}", err);
            }
        });
    });
}


async fn health_check_handler() -> &'static str {
    "OK"
}

async fn get_status_handler(State(state): State<AppState>) -> impl IntoResponse {
    let current = state.focus.read().unwrap().clone();
    (StatusCode::OK, Json(current))
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: AppState) {
    let mut rx = state.tx.subscribe();

    // Send initial state immediately upon connection
    let initial_state = {
        let current = state.focus.read().unwrap();
        serde_json::to_string(&*current).unwrap_or_default()
    };

    if !initial_state.is_empty() {
        if let Err(e) = socket.send(Message::Text(initial_state)).await {
            eprintln!("[Jarvis Server WS] Error sending initial state: {}", e);
            return;
        }
    }

    let (mut sender, mut receiver) = socket.split();

    // Task to forward broadcast updates to this WebSocket client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let Ok(json_str) = serde_json::to_string(&msg) {
                if sender.send(Message::Text(json_str)).await.is_err() {
                    break;
                }
            }
        }
    });

    // Task to read incoming messages (heartbeats / commands)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Ping(p) => {
                    // Axum automatically answers ping with pong, or we can handle
                    let _ = p;
                }
                Message::Text(text) => {
                    // Extension can send ping or commands
                    println!("[Jarvis Server WS] Received message: {}", text);
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // If any task exits, abort the other
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
