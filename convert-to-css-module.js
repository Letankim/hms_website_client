const fs = require('fs');
const path = require('path');

const targetFilePath = path.resolve(__dirname,'src/components/Auth/Forgot.jsx');
function convertCssFile() {
    const cssPath = targetFilePath.replace(/\.(jsx|tsx)$/,'.css');
    const moduleCssPath = targetFilePath.replace(/\.(jsx|tsx)$/,'.module.css');

    if (fs.existsSync(cssPath) && !fs.existsSync(moduleCssPath)) {
        fs.renameSync(cssPath,moduleCssPath);
        console.log(`✅ Renamed: ${cssPath} → ${moduleCssPath}`);
    }
}

function convertJsxFile() {
    if (!fs.existsSync(targetFilePath)) {
        console.error(`❌ File not found: ${targetFilePath}`);
        return;
    }

    let content = fs.readFileSync(targetFilePath,'utf-8');
    let changed = false;

    // Match: className="a b c"
    content = content.replace(/className="([^"]+)"/g,(_,classNames) => {
        const classArray = classNames.trim().split(/\s+/);
        const replaced = classArray.map(name => `styles["${name}"]`).join(' + " " + ');
        changed = true;
        return `className={${replaced}}`;
    });

    // Tự thêm import nếu chưa có
    const filename = path.basename(targetFilePath,path.extname(targetFilePath));
    const moduleImport = `import styles from './${filename}.module.css';`;

    if (!content.includes("import styles from")) {
        content = `${moduleImport}\n${content}`;
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(targetFilePath,content,'utf-8');
        console.log(`✨ Updated: ${targetFilePath}`);
    } else {
        console.log(`ℹ️ No changes made to: ${targetFilePath}`);
    }
}

// 🔧 Chạy các hàm
convertCssFile();
convertJsxFile();
