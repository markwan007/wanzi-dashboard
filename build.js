#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('开始构建过程...');

// 读取环境变量
const envVars = {
    'REACT_APP_FIREBASE_API_KEY': process.env.REACT_APP_FIREBASE_API_KEY,
    'REACT_APP_FIREBASE_AUTH_DOMAIN': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    'REACT_APP_FIREBASE_PROJECT_ID': process.env.REACT_APP_FIREBASE_PROJECT_ID,
    'REACT_APP_FIREBASE_STORAGE_BUCKET': process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID': process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    'REACT_APP_FIREBASE_APP_ID': process.env.REACT_APP_FIREBASE_APP_ID,
    'REACT_APP_FIREBASE_MEASUREMENT_ID': process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// 验证必要的环境变量
const requiredVars = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_PROJECT_ID'];
for (const varName of requiredVars) {
    if (!envVars[varName]) {
        console.error(`错误: 缺少必要的环境变量 ${varName}`);
        process.exit(1);
    }
}

// 读取 index.html 文件
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 替换环境变量占位符
for (const [key, value] of Object.entries(envVars)) {
    if (value) {
        // 将占位符替换为实际值，并用引号包围
        indexContent = indexContent.replace(new RegExp(`"${key}"`, 'g'), `"${value}"`);
        console.log(`✓ 已替换 ${key}`);
    }
}

// 写回文件
fs.writeFileSync(indexPath, indexContent);

console.log('✓ 构建完成！Firebase配置已注入。');
