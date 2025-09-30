# 部署配置说明

## Netlify 环境变量设置

为了安全地部署到 Netlify 并避免 API 密钥暴露，需要在 Netlify 后台设置以下环境变量：

### 必需的环境变量

在 Netlify 项目设置 > Environment Variables 中添加：

```
REACT_APP_FIREBASE_API_KEY=AIzaSyBfmegqNS3818hvlejBTsV3DIiyuL9KoGk
REACT_APP_FIREBASE_AUTH_DOMAIN=systemwork-6e09a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=systemwork-6e09a
REACT_APP_FIREBASE_STORAGE_BUCKET=systemwork-6e09a.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=421508436035
REACT_APP_FIREBASE_APP_ID=1:421508436035:web:b091bdcd728d8aa2cf84f6
REACT_APP_FIREBASE_MEASUREMENT_ID=G-YP362VB7FJ
```

### 部署流程

1. 在 Netlify 后台设置上述环境变量
2. 推送代码到 Git 仓库
3. Netlify 自动构建时会运行 `node build.js`
4. 构建脚本会将环境变量注入到 HTML 文件中
5. 部署完成后，Firebase 配置将正确生效

### 本地开发

本地开发时，可以直接在 `index.html` 中使用真实的 Firebase 配置值进行测试，但不要提交到 Git。

### 故障排除

如果遇到 "Firebase: Error (auth/api-key-not-valid)" 错误：
1. 检查 Netlify 环境变量是否正确设置
2. 确保所有必需的环境变量都已配置
3. 重新部署项目以应用新的环境变量
