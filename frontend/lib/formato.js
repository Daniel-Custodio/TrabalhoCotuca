export const soDigitos = (v) => String(v ?? '').replace(/\D/g, '');

// 52998224725 -> 529.982.247-25 (funciona tambem com o CPF pela metade, enquanto digita)
export function mascaraCpf(v) {
  return soDigitos(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// 19999998888 -> (19) 99999-8888 | 1933334444 -> (19) 3333-4444
export function mascaraCelular(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = resto.length > 8 ? 5 : 4;
  if (resto.length <= corte) return `(${ddd}) ${resto}`;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

export const mascaras = { cpf: mascaraCpf, celular: mascaraCelular };

// O banco devolve "2000-05-10T00:00:00.000Z"; usamos o texto direto para nao mudar o dia por causa do fuso
export function dataBR(v) {
  return String(v).slice(0, 10).split('-').reverse().join('/');
}

export function dataHoraBR(v) {
  const s = String(v);
  return `${dataBR(s)} ${s.slice(11, 16)}`;
}

export const semAcento = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
