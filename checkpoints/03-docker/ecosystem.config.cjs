// PM2: pastikan API sentiasa hidup.
//
//   pm2 start ecosystem.config.cjs   mula
//   pm2 ls                           senarai program & status
//   pm2 logs inventori-api           baca log (tekan Ctrl + C untuk keluar)
//   pm2 restart inventori-api        mula semula
module.exports = {
  apps: [
    {
      name: 'inventori-api', // nama yang dipaparkan dalam "pm2 ls"
      script: 'node_modules/json-server/lib/bin.js', // program yang dijalankan (json-server)
      args: 'db.json --port 3000', // sama seperti: json-server db.json --port 3000
      autorestart: true, // program mati? PM2 hidupkan semula
      max_memory_restart: '300M', // guna memori lebih 300 MB? PM2 restart
    },
  ],
}
