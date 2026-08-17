mod server;

use server::{start_local_server, FocusState};
use std::sync::{Arc, RwLock};
use tauri::State;
use tokio::sync::broadcast;

pub struct GlobalFocusState {
    pub state: Arc<RwLock<FocusState>>,
    pub tx: broadcast::Sender<FocusState>,
}

#[tauri::command]
fn update_focus_state(
    new_state: FocusState,
    global: State<'_, GlobalFocusState>,
) -> Result<FocusState, String> {
    {
        let mut write_guard = global.state.write().map_err(|e| e.to_string())?;
        *write_guard = new_state.clone();
    }
    // Broadcast update to all WebSocket clients (LibreWolf extension)
    let _ = global.tx.send(new_state.clone());
    Ok(new_state)
}

#[tauri::command]
fn get_focus_state(global: State<'_, GlobalFocusState>) -> Result<FocusState, String> {
    let read_guard = global.state.read().map_err(|e| e.to_string())?;
    Ok(read_guard.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (tx, _rx) = broadcast::channel::<FocusState>(100);
    let focus_state = Arc::new(RwLock::new(FocusState::default()));

    // Start Axum HTTP & WebSocket local bridge server
    start_local_server(Arc::clone(&focus_state), tx.clone());

    tauri::Builder::default()
        .manage(GlobalFocusState {
            state: Arc::clone(&focus_state),
            tx,
        })
        .invoke_handler(tauri::generate_handler![
            update_focus_state,
            get_focus_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
