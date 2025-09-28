
import { setDataSimulada } from "../lib/simuladorData";


const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Uso: npm run simular YYYY-MM-DD");
  process.exit(1);
}

const date = args[0];
setDataSimulada(date);
console.log("✅ Data simulada definida para:", date);
