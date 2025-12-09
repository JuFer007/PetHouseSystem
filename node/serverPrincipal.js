const { spawn } = require('child_process');

const services = [
  { name: 'Clima', path: './clima-service/server.js', port: 3001 },
  { name: 'Excel', path: './excel-service/server.js', port: 3003 },
  { name: 'Factura', path: './factura-service/server.js', port: 3004 },
  { name: 'Index', path: './index-service/server.js', port: 3005 },
  { name: 'Raza', path: './raza-service/server.js', port: 3006 },
  { name: 'Reniec', path: './reniec-service/server.js', port: 3002 },
  { name: 'PDF', path: './pdf-service/server.js', port: 3007 }
];

const processes = [];

console.log('\n=================================================');
console.log('  INICIANDO SISTEMA VETERINARIO - MICROSERVICIOS');
console.log('=================================================\n');

function startService(service) {
  console.log(`[INICIO] Levantando ${service.name} en puerto ${service.port}...`);

  const child = spawn('node', [service.path], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT: service.port }
  });

  child.on('error', (error) => {
    console.error(`[ERROR] ${service.name}: ${error.message}`);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`[ERROR] ${service.name} terminó con código ${code}`);
    }
  });

  processes.push({ name: service.name, process: child, port: service.port });
}

services.forEach(service => startService(service));

console.log('\n=================================================');
console.log('  TODOS LOS SERVICIOS HAN SIDO INICIADOS');
console.log('=================================================');
console.log('\nServicios activos:');
services.forEach(s => {
  console.log(`  ✓ ${s.name.padEnd(10)} → http://localhost:${s.port}`);
});
console.log('\nPresiona Ctrl+C para detener todos los servicios\n');

function shutdown() {
  console.log('\n\n[APAGANDO] Deteniendo todos los servicios...\n');

  processes.forEach(({ name, process }) => {
    try {
      process.kill();
      console.log(`  ✓ ${name} detenido`);
    } catch (error) {
      console.error(`  ✗ Error al detener ${name}`);
    }
  });

  console.log('\n[COMPLETADO] Sistema detenido\n');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
