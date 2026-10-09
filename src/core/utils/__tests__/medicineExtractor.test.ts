import { extractMedicineInfo } from '../medicineExtractor';

describe('extractMedicineInfo', () => {
  it('extrae nombre, dosis mg y presentación cápsula', () => {
    const info = extractMedicineInfo(
      'AMOXICILINA\nCápsulas\n500 mg\nOral',
    );
    expect(info.name).toBe('Amoxicilina');
    expect(info.dosage).toBe('500 mg');
    expect(info.presentation).toBe('Cápsula');
  });

  it('reconoce dosis en µg y presentación gotas', () => {
    const info = extractMedicineInfo(
      'Colecalciferol\ngotas\n25 µg\nUso oral',
    );
    expect(info.dosage).toBe('25 µg');
    expect(info.presentation).toBe('Gotas');
  });

  it('reconoce jarabe y dosis en ml', () => {
    const info = extractMedicineInfo(
      'PARACETAMOL INFANTIL\nJarabe\n120 mg/5 ml',
    );
    expect(info.name).toBe('Paracetamol Infantil');
    expect(info.presentation).toBe('Jarabe');
  });

  it('no contamina el nombre con ruido de etiqueta', () => {
    const info = extractMedicineInfo(
      'Reg. Sanitario INVIMA 2020M-001234\nIBUPROFENO\n400 mg\nVenta libre\nwww.laboratorio.com',
    );
    expect(info.name).toBe('Ibuprofeno');
    expect(info.dosage).toBe('400 mg');
  });

  it('devuelve valores vacíos si no hay texto', () => {
    const info = extractMedicineInfo('');
    expect(info.name).toBe('');
    expect(info.dosage).toBe('');
    expect(info.presentation).toBe('Otro');
  });
});