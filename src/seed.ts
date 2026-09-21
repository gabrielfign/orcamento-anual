import { emptyValues, type Category, type LineItem, type YearBudget } from './types'

function item(id: string, name: string): LineItem {
  return { id, name, values: emptyValues() }
}

function category(id: string, name: string, names: string[]): Category {
  return {
    id,
    name,
    items: names.map((n, i) => item(`${id}-${i + 1}`, n)),
  }
}

export const DEFAULT_EXPENSES: Category[] = [
  category('cartao', 'Cartão de crédito', ['Cartão 1', 'Cartão 2', 'Cartão 3']),
  category('casa', 'Casa', [
    'Aluguel/financiamento imobiliário',
    'Energia elétrica',
    'Água',
    'Gás',
    'Mercado',
    'Internet',
    'IPTU',
    'Seguro Residencial',
  ]),
  category('filhos', 'Filhos', [
    'Escola/Creche',
    'Cursos extras',
    'Atividades',
    'Roupas',
    'Brinquedos',
    'Mesada',
  ]),
  category('entretenimento', 'Entretenimento', [
    'Streamings',
    'Viagem',
    'Restaurantes',
    'Lazer',
    'Delivery',
  ]),
  category('cuidados', 'Cuidados pessoais', ['Cabelo', 'Roupas', 'Calçados', 'Seguro de Vida']),
  category('saude', 'Saúde', [
    'Médico/dentista/óculos',
    'Cuidados especiais',
    'Farmácia',
    'Emergência',
    'Seguro/Assistência Médica',
    'Outros',
  ]),
  category('pets', 'Animais de estimação', [
    'Alimentação',
    'Veterinário',
    'Brinquedos',
    'Banho',
    'Outros',
  ]),
  category('transporte', 'Transporte', [
    'Combustível',
    'Prestações do carro',
    'IPVA',
    'Seguro',
    'Transporte por aplicativo',
    'Transporte público',
    'Outros',
  ]),
  category('viagens', 'Viagens', [
    'Passagem aérea',
    'Hotéis',
    'Alimentação',
    'Transporte',
    'Entretenimento',
    'Outros',
  ]),
  category('outros', 'Outros', ['Categoria 1', 'Categoria 2']),
]

export const DEFAULT_INCOME: Category[] = [
  category('profissional', 'Profissional', [
    'Pagamento',
    'Bônus',
    'Comissão',
    'Vale-Refeição / Vale-Alimentação',
    'Vale-Transporte',
    'Trabalho Autônomo',
    'Outros',
  ]),
  category('renda-outros', 'Outros', [
    'Quanto guardou',
    'Investimentos',
    'Presentes',
    'Outros',
  ]),
]

export function createYearBudget(year: number, startingBalance = 0): YearBudget {
  return {
    year,
    startingBalance,
    expenses: structuredClone(DEFAULT_EXPENSES),
    income: structuredClone(DEFAULT_INCOME),
  }
}

export function cloneStructure(from: YearBudget, year: number): YearBudget {
  const cloneItems = (items: LineItem[]) =>
    items.map((it) => ({ id: it.id, name: it.name, values: emptyValues() }))
  const cloneCats = (cats: Category[]) =>
    cats.map((c) => ({ id: c.id, name: c.name, items: cloneItems(c.items) }))
  return {
    year,
    startingBalance: from.startingBalance,
    expenses: cloneCats(from.expenses),
    income: cloneCats(from.income),
  }
}
