import * as vscode from "vscode";

function getRootPath() {
  return vscode.workspace.rootPath || '.';
}

function beautify(text: string) {
  text = text.replace(/{\s*}/g, "");
  // remove nil value, = nil, =,
  text = text.replace(/^.*=\s*(nil)?,?\s*$/gm, "");
  // remove empty lines
  text = text.replace(/^\s*\r?\n/gm, "");
  return text
}

// 插件激活时的入口
export function activate(context: vscode.ExtensionContext) {
  const fs = require("fs");
  const path = require("path");

  // vscode.window.showInformationMessage("Init Extension");

  let codePath = path.join(context.extensionPath, "snippets", "snippets.code-snippets");
  let fileUri = vscode.Uri.file(codePath);
  let snippets :any = null;
  let cmdlist :string[] = [];
  let crlf = "\n";

  vscode.workspace.fs.readFile(fileUri).then((content) => {
    let snippetBuf = Buffer.from(content).toString('utf8');
    //vscode.window.showInformationMessage('readFile ' + snippetBuf.length);
    snippets = JSON.parse(snippetBuf);
    //let test = require(path.join(__dirname, "snippets", "snippets.code-snippets"));
    //let test = getRootPath();

    Object.keys(snippets).forEach((k : string) => {
      let v = snippets[k];
      v.bodyStr = v.body.join(crlf);
      cmdlist.push(k + "\t" + v.description);
    })
    vscode.window.showInformationMessage("Init ShenQi Snippets OK!");
    // vscode.window.showInformationMessage(cmdlist.toString());
  })

  // fs.readFile(codePath, 'utf8', (err: any, content: any) => {
  //   vscode.window.showInformationMessage('fs.readFile ' + content.length);
  // })

  // 注册 extension.helloWorld 命令
  let disposable = vscode.commands.registerCommand("shenqi.showAll", () => {
    if (snippets == null)
      return;
    
    vscode.window.showQuickPick(cmdlist).then(value => {
        // vscode.window.showInformationMessage('User choose ' + value);
        let k = value?.split("\t")[0];
        if (k == undefined)
          return;
        let v = snippets[k];
        vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(v.bodyStr));
    })
  });

  // 给插件订阅 helloWorld 命令
  context.subscriptions.push(disposable);

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((td) => {
    // vscode.window.showInformationMessage(`did save ${td.uri.fsPath} ${td.lineCount}`);
  }));
  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument((e) => {
    let {document} = e;
    let text = document.getText();
    let text2 = text;
    
    let l = 0;
    while (text2.length != l) {
      l = text2.length;
      text2 = beautify(text2);
    }

    let start = new vscode.Position(0, 0);
    let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    let range = new vscode.Range(start, end);
    e.waitUntil(Promise.resolve([
      vscode.TextEdit.replace(range, text2)
    ]));
    // vscode.window.showInformationMessage(`will save ${document.lineCount}`);
  }));

  // return 的内容可以作为这个插件对外的接口
  return {
    hello() {
      return "hello world";
    }
  };
}

// 插件释放的时候触发
export function deactivate() {}