module.exports = {
  // 项目配置
  project: {
    name: 'fe-dbt',
    version: '0.1.0',
    description: 'DBT Ecological Protocol Token Platform'
  },

  // 构建配置
  build: {
    // 输出目录
    outputDir: 'dist',
    
    // 是否启用静态导出
    staticExport: true,
    
    // 是否压缩代码
    minify: true,
    
    // 是否生成 source map
    sourceMap: false,
    
    // 排除的文件和目录
    exclude: [
      'node_modules/**',
      '.git/**',
      'scripts/**',
      'deploy.config.js',
      '*.log'
    ]
  },

  // 部署配置
  deploy: {
    // 部署包输出目录
    packageDir: 'packages',
    
    // 是否包含配置文件
    includeConfigs: true,
    
    // 是否创建部署说明
    createReadme: true,
    
    // 是否自动压缩
    autoZip: false
  },

  // 服务器配置
  server: {
    // 静态文件目录
    staticDir: 'dist',
    
    // 端口
    port: 3000,
    
    // 是否启用 gzip 压缩
    gzip: true,
    
    // 缓存配置
    cache: {
      maxAge: '1d',
      etag: true
    }
  }
}; 