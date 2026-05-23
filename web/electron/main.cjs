const { app, BrowserWindow, Menu, net, protocol } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_PROTOCOL = "dungeondebt";

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function response(text, status, contentType = "text/plain") {
  return new Response(text, {
    status,
    headers: { "content-type": contentType },
  });
}

function resolveAppAsset(requestUrl) {
  const appRoot = app.getAppPath();
  const parsed = new URL(requestUrl);
  const requestedPath = decodeURIComponent(parsed.pathname || "/index.html");
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  const filePath = path.normalize(path.join(appRoot, relativePath));
  const normalizedRoot = path.normalize(appRoot + path.sep);

  if (!filePath.startsWith(normalizedRoot)) {
    return null;
  }

  return filePath;
}

function registerAppProtocol() {
  protocol.handle(APP_PROTOCOL, async (request) => {
    const filePath = resolveAppAsset(request.url);

    if (!filePath) {
      return response("Forbidden", 403);
    }

    const targetPath = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;

    if (!fs.existsSync(targetPath)) {
      return response("Not found", 404);
    }

    return net.fetch(pathToFileURL(targetPath).toString());
  });
}

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    title: "Dungeon Debt",
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: "#14110c",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (process.env.DUNGEONDEBT_DEVTOOLS === "1") {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.loadURL(`${APP_PROTOCOL}://game/index.html`);
}

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
