const vscode = require('vscode');
const axios = require('axios');

const API_KEY = process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE';

async function callClaude(message) {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [{ role: 'user', content: message }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });
        return response.data.content[0].text;
    } catch (error) {
        return 'Error: ' + error.message;
    }
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('claude.chat', async () => {
        const message = await vscode.window.showInputBox({
            prompt: 'พิมพ์ข้อความถึง Claude',
            placeHolder: 'ข้อความของคุณ...'
        });

        if (message) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "กำลังส่งข้อความถึง Claude...",
                cancellable: false
            }, async () => {
                const response = await callClaude(message);
                
                const panel = vscode.window.createWebviewPanel(
                    'claudeResponse',
                    'Claude Response',
                    vscode.ViewColumn.One,
                    {}
                );

                panel.webview.html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .user { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 5px; }
                            .claude { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="user"><strong>คุณ:</strong> ${message}</div>
                        <div class="claude"><strong>Claude:</strong> ${response}</div>
                    </body>
                    </html>
                `;
            });
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };