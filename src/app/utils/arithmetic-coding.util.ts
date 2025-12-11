import Decimal from 'decimal.js';

export interface ArithmeticResult {
  code: string;
  length: number;
  frequencies: Record<string, number>;
}

export function encodeArithmetic(text: string): ArithmeticResult {
  const freq: Record<string, number> = {};
  const order: string[] = [];

  // frecuencias preservando orden
  for (const ch of text) {
    if (!(ch in freq)) {
      freq[ch] = 0;
      order.push(ch);
    }
    freq[ch]++;
  }

  const total = Object.values(freq).reduce((a, b) => a + b, 0);
  const probs: Record<string, Decimal> = {};
  for (const ch of order) {
    probs[ch] = new Decimal(freq[ch]).div(total);
  }

  // rangos acumulados
  const ranges: Record<string, { low: Decimal; high: Decimal }> = {};
  let acc = new Decimal(0);
  for (const ch of order) {
    const low = acc;
    const high = acc.add(probs[ch]);
    ranges[ch] = { low, high };
    acc = high;
  }

  // intervalo final
  let low = new Decimal(0);
  let high = new Decimal(1);

  for (const ch of text) {
    const r = high.sub(low);
    const { low: Li, high: Ls } = ranges[ch];
    high = low.add(r.mul(Ls));
    low = low.add(r.mul(Li));
  }

  const code = low.add(high).div(2).toString(); // como string exacto

  return {
    code,
    length: text.length,
    frequencies: freq,
  };
}

export function decodeArithmetic(
  code: string,
  length: number,
  frequencies: Record<string, number>
): string {
  const R = new Decimal(code);

  const order = Object.keys(frequencies);

  const total = Object.values(frequencies).reduce((a, b) => a + b, 0);
  const probs: Record<string, Decimal> = {};
  for (const ch of order) {
    probs[ch] = new Decimal(frequencies[ch]).div(total);
  }

  const ranges: Record<string, { low: Decimal; high: Decimal }> = {};
  let acc = new Decimal(0);
  for (const ch of order) {
    const low = acc;
    const high = acc.add(probs[ch]);
    ranges[ch] = { low, high };
    acc = high;
  }

  let Rn = R;
  let mensaje = '';

  for (let i = 0; i < length; i++) {
    for (const ch of order) {
      const { low, high } = ranges[ch];
      if (Rn.greaterThanOrEqualTo(low) && Rn.lessThan(high)) {
        mensaje += ch;
        Rn = Rn.sub(low).div(probs[ch]);
        break;
      }
    }
  }

  return mensaje;
}

