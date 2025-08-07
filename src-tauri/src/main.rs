// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use tauri::command;

#[command]
fn trigger_shutdown_state(command: &str) -> Result<(), String> {
    let output = match command {
        "sleep" => {
            if cfg!(target_os = "windows") {
                Command::new("rundll32.exe")
                    .args(["powrprof.dll,SetSuspendState", "0,1,0"])
                    .output()
            } else if cfg!(target_os = "macos") {
                Command::new("pmset").arg("sleepnow").output()
            } else if cfg!(target_os = "linux") {
                Command::new("systemctl").arg("suspend").output()
            } else {
                return Err("Unsupported OS".into());
            }
        }

        "hibernate" => {
            if cfg!(target_os = "windows") {
                Command::new("rundll32.exe")
                    .arg("powrprof.dll,SetSuspendState Hibernate")
                    .output()
            } else if cfg!(target_os = "linux") {
                Command::new("systemctl").arg("hibernate").output()
            } else {
                return Err("Unsupported OS".into());
            }
        }

        "shutdown" => {
            if cfg!(target_os = "windows") {
                Command::new("shutdown")
                    .args([
                        "/s",
                        "/f",
                        "/t",
                        "60",
                        "/c",
                        "Komputer anda akan mati dalam 60 detik :)",
                    ])
                    .output()
            } else if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
                Command::new("shutdown").args(["-h", "+1"]).output()
            } else {
                return Err("Unsupported OS".into());
            }
        }

        "cancelShutdown" => {
            if cfg!(target_os = "windows") {
                Command::new("shutdown").arg("/a").output()
            } else if cfg!(target_os = "macos") {
                Command::new("killall").arg("shutdown").output()
            } else if cfg!(target_os = "linux") {
                Command::new("shutdown").arg("-c").output()
            } else {
                return Err("Unsupported OS".into());
            }
        }

        _ => return Err("Unknown command".into()),
    };

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        }
        Err(err) => Err(err.to_string()),
    }
}

#[command]
fn closing_app(_code: u8) {
    std::process::exit(0);
}

fn main() {
    //     sa_pc_exam_2_lib::run()
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            trigger_shutdown_state,
            closing_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
