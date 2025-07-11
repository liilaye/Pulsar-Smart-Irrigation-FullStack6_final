// Service ML intelligent avec calculs réalistes pour la démo
interface WeatherData {
  temperature: number;        // °C
  humidity: number;          // %
  precipitation: number;     // mm
  windSpeed: number;         // km/h
  pressure: number;          // hPa
  uvIndex: number;          // 0-12
}

interface SoilData {
  temperature: number;       // °C
  moisture: number;         // %
  ph: number;              // 6.0-8.0
  ec: number;              // dS/m (conductivité électrique)
  nitrogen: number;        // mg/kg
  phosphorus: number;      // mg/kg
  potassium: number;       // mg/kg
  organicMatter: number;   // %
}

interface CropData {
  type: 'tomate' | 'laitue' | 'carotte' | 'radis' | 'oignon' | 'chou';
  stage: 'semis' | 'croissance' | 'floraison' | 'maturation';
  plantingDate: Date;
  area: number;            // m²
  density: number;         // plants/m²
}

interface IrrigationRecommendation {
  volume_m3: number;
  volume_litres: number;
  duree_minutes: number;
  duree_sec: number;
  efficiency: number;      // %
  reason: string;
  factors: {
    weather: number;       // Impact météo (0-1)
    soil: number;         // Impact sol (0-1)
    crop: number;         // Impact culture (0-1)
    season: number;       // Impact saisonnier (0-1)
  };
  nextIrrigation: Date;
  confidenceLevel: number; // %
}

class SmartMLService {
  // Paramètres par culture (coefficient multiplicateur)
  private cropCoefficients = {
    tomate: { base: 1.0, semis: 0.3, croissance: 0.7, floraison: 1.2, maturation: 0.8 },
    laitue: { base: 0.8, semis: 0.2, croissance: 0.6, floraison: 1.0, maturation: 0.7 },
    carotte: { base: 0.7, semis: 0.2, croissance: 0.5, floraison: 0.8, maturation: 0.6 },
    radis: { base: 0.6, semis: 0.3, croissance: 0.7, floraison: 0.9, maturation: 0.5 },
    oignon: { base: 0.9, semis: 0.2, croissance: 0.6, floraison: 1.1, maturation: 0.4 },
    chou: { base: 1.1, semis: 0.3, croissance: 0.8, floraison: 1.3, maturation: 0.9 }
  };

  // Volume de base par m² selon la saison (L/m²)
  private baseVolumePerM2 = {
    printemps: 4.0,  // Mars-Mai
    ete: 6.0,        // Juin-Août
    automne: 3.0,    // Sept-Nov
    hiver: 2.0       // Déc-Fév
  };

  // Génère des données météo réalistes pour Dakar
  generateRealisticWeather(): WeatherData {
    const month = new Date().getMonth(); // 0-11
    let baseTemp, baseHumidity, basePrecip;

    // Climat tropical de Dakar
    if (month >= 5 && month <= 10) { // Saison des pluies (Juin-Nov)
      baseTemp = 26 + Math.random() * 6;      // 26-32°C
      baseHumidity = 70 + Math.random() * 25; // 70-95%
      basePrecip = Math.random() * 15;        // 0-15mm
    } else { // Saison sèche (Déc-Mai)
      baseTemp = 22 + Math.random() * 8;      // 22-30°C
      baseHumidity = 45 + Math.random() * 30; // 45-75%
      basePrecip = Math.random() * 2;         // 0-2mm
    }

    return {
      temperature: Math.round(baseTemp * 10) / 10,
      humidity: Math.round(baseHumidity * 10) / 10,
      precipitation: Math.round(basePrecip * 10) / 10,
      windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
      pressure: Math.round((1010 + Math.random() * 20) * 10) / 10,
      uvIndex: Math.round((6 + Math.random() * 6) * 10) / 10
    };
  }

  // Génère des données de sol réalistes
  generateRealisticSoil(): SoilData {
    return {
      temperature: Math.round((20 + Math.random() * 12) * 10) / 10,
      moisture: Math.round((25 + Math.random() * 50) * 10) / 10,
      ph: Math.round((6.0 + Math.random() * 2.0) * 100) / 100,
      ec: Math.round((0.8 + Math.random() * 1.5) * 100) / 100,
      nitrogen: Math.round(80 + Math.random() * 80),
      phosphorus: Math.round(60 + Math.random() * 60),
      potassium: Math.round(70 + Math.random() * 70),
      organicMatter: Math.round((2.0 + Math.random() * 4.0) * 10) / 10
    };
  }

  // Génère des données de culture
  generateRealisticCrop(): CropData {
    const crops: CropData['type'][] = ['tomate', 'laitue', 'carotte', 'radis', 'oignon', 'chou'];
    const stages: CropData['stage'][] = ['semis', 'croissance', 'floraison', 'maturation'];
    
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - Math.floor(Math.random() * 90)); // 0-90 jours

    return {
      type: crops[Math.floor(Math.random() * crops.length)],
      stage: stages[Math.floor(Math.random() * stages.length)],
      plantingDate,
      area: Math.round((500 + Math.random() * 4500) * 10) / 10, // 500-5000 m²
      density: Math.round((2 + Math.random() * 8) * 10) / 10     // 2-10 plants/m²
    };
  }

  // Algorithme ML intelligent pour recommandation d'irrigation
  async calculateSmartIrrigation(): Promise<IrrigationRecommendation> {
    await this.simulateMLProcessing(1500); // Simulation traitement IA

    const weather = this.generateRealisticWeather();
    const soil = this.generateRealisticSoil();
    const crop = this.generateRealisticCrop();

    console.log('🧠 [IA DEMO] Données d\'entrée:', { weather, soil, crop });

    // 1. Calcul du coefficient météorologique
    const weatherFactor = this.calculateWeatherFactor(weather);

    // 2. Calcul du coefficient de sol
    const soilFactor = this.calculateSoilFactor(soil);

    // 3. Calcul du coefficient de culture
    const cropFactor = this.calculateCropFactor(crop);

    // 4. Calcul du coefficient saisonnier
    const seasonFactor = this.calculateSeasonFactor();

    console.log('🧠 [IA DEMO] Facteurs calculés:', {
      weather: weatherFactor,
      soil: soilFactor,
      crop: cropFactor,
      season: seasonFactor
    });

    // 5. Volume de base selon la saison
    const season = this.getCurrentSeason();
    const baseVolume = this.baseVolumePerM2[season];

    // 6. Calcul du volume total avec tous les facteurs
    const adjustedVolume = baseVolume * crop.area * 
                          weatherFactor * soilFactor * cropFactor * seasonFactor;

    // Limites réalistes : 200L minimum, 3000L maximum
    const finalVolume = Math.max(200, Math.min(3000, adjustedVolume));
    const volumeM3 = finalVolume / 1000;

    // 7. Calcul de la durée (débit simulé : 15L/min)
    const debitLitresParMin = 15;
    const dureeMinutes = finalVolume / debitLitresParMin;
    const dureeSec = Math.round(dureeMinutes * 60);

    // 8. Calcul de l'efficacité et de la confiance
    const efficiency = this.calculateEfficiency(weather, soil, crop);
    const confidenceLevel = this.calculateConfidence(weather, soil, crop);

    // 9. Prédiction prochaine irrigation
    const nextIrrigation = this.predictNextIrrigation(weather, soil, crop, dureeMinutes);

    const recommendation: IrrigationRecommendation = {
      volume_m3: Math.round(volumeM3 * 1000) / 1000,
      volume_litres: Math.round(finalVolume),
      duree_minutes: Math.round(dureeMinutes * 100) / 100,
      duree_sec: dureeSec,
      efficiency: Math.round(efficiency),
      reason: this.generateExplanation(weather, soil, crop, weatherFactor, soilFactor, cropFactor),
      factors: {
        weather: Math.round(weatherFactor * 100) / 100,
        soil: Math.round(soilFactor * 100) / 100,
        crop: Math.round(cropFactor * 100) / 100,
        season: Math.round(seasonFactor * 100) / 100
      },
      nextIrrigation,
      confidenceLevel: Math.round(confidenceLevel)
    };

    console.log('🧠 [IA DEMO] Recommandation finale:', recommendation);
    return recommendation;
  }

  private calculateWeatherFactor(weather: WeatherData): number {
    let factor = 1.0;

    // Impact température (optimal: 20-28°C)
    if (weather.temperature > 30) factor += 0.3;
    else if (weather.temperature > 35) factor += 0.5;
    else if (weather.temperature < 15) factor -= 0.2;

    // Impact humidité (optimal: 60-80%)
    if (weather.humidity < 50) factor += 0.2;
    else if (weather.humidity < 30) factor += 0.4;
    else if (weather.humidity > 85) factor -= 0.1;

    // Impact précipitation récente
    if (weather.precipitation > 5) factor -= 0.3;
    else if (weather.precipitation > 15) factor -= 0.6;

    // Impact vent (évaporation)
    if (weather.windSpeed > 20) factor += 0.1;

    return Math.max(0.3, Math.min(2.0, factor));
  }

  private calculateSoilFactor(soil: SoilData): number {
    let factor = 1.0;

    // Impact humidité du sol (critique)
    if (soil.moisture < 30) factor += 0.5;
    else if (soil.moisture < 20) factor += 0.8;
    else if (soil.moisture > 70) factor -= 0.4;

    // Impact pH (optimal: 6.5-7.5)
    if (soil.ph < 6.0 || soil.ph > 8.0) factor += 0.1;

    // Impact conductivité électrique (salinité)
    if (soil.ec > 2.0) factor -= 0.2;

    // Impact matière organique (rétention d'eau)
    if (soil.organicMatter < 2.0) factor += 0.1;
    else if (soil.organicMatter > 5.0) factor -= 0.1;

    return Math.max(0.4, Math.min(1.8, factor));
  }

  private calculateCropFactor(crop: CropData): number {
    const coeffs = this.cropCoefficients[crop.type];
    let factor = coeffs.base * coeffs[crop.stage];

    // Ajustement selon l'âge de la culture
    const ageInDays = Math.floor((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 14) factor *= 0.5;        // Très jeune
    else if (ageInDays < 30) factor *= 0.8;   // Jeune
    else if (ageInDays > 120) factor *= 0.7;  // Mature

    // Ajustement selon la densité
    if (crop.density > 8) factor *= 1.1;      // Haute densité
    else if (crop.density < 3) factor *= 0.9;  // Faible densité

    return Math.max(0.3, Math.min(1.5, factor));
  }

  private calculateSeasonFactor(): number {
    const month = new Date().getMonth();
    
    // Ajustement saisonnier pour le Sénégal
    if (month >= 5 && month <= 10) return 1.2;  // Saison des pluies
    else if (month >= 11 || month <= 1) return 0.8;  // Saison fraîche
    else return 1.0;  // Saison sèche chaude
  }

  private getCurrentSeason(): keyof typeof this.baseVolumePerM2 {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'printemps';
    if (month >= 5 && month <= 7) return 'ete';
    if (month >= 8 && month <= 10) return 'automne';
    return 'hiver';
  }

  private calculateEfficiency(weather: WeatherData, soil: SoilData, crop: CropData): number {
    let efficiency = 75; // Base 75%

    // Facteurs d'amélioration
    if (soil.moisture >= 30 && soil.moisture <= 60) efficiency += 10;
    if (weather.humidity >= 60 && weather.humidity <= 80) efficiency += 8;
    if (soil.ph >= 6.5 && soil.ph <= 7.5) efficiency += 5;
    if (weather.temperature >= 20 && weather.temperature <= 28) efficiency += 7;

    // Facteurs de dégradation
    if (weather.windSpeed > 25) efficiency -= 10;
    if (soil.ec > 2.5) efficiency -= 15;
    if (weather.precipitation > 10) efficiency -= 5;

    return Math.max(40, Math.min(95, efficiency));
  }

  private calculateConfidence(weather: WeatherData, soil: SoilData, crop: CropData): number {
    let confidence = 85; // Base 85%

    // Facteurs de confiance
    if (soil.moisture > 0) confidence += 5;  // Capteur sol fonctionnel
    if (weather.temperature > 0) confidence += 5; // Météo disponible
    if (crop.plantingDate) confidence += 5; // Données culture disponibles

    // Facteurs d'incertitude
    if (weather.precipitation > 20) confidence -= 10; // Météo instable
    if (soil.ec > 3.0) confidence -= 8; // Sol problématique

    return Math.max(60, Math.min(98, confidence));
  }

  private predictNextIrrigation(weather: WeatherData, soil: SoilData, crop: CropData, currentDuration: number): Date {
    let hoursUntilNext = 24; // Base 24h

    // Ajustements selon les conditions
    if (weather.temperature > 30) hoursUntilNext -= 6;
    if (weather.humidity < 50) hoursUntilNext -= 4;
    if (soil.moisture < 30) hoursUntilNext -= 8;
    if (crop.stage === 'floraison') hoursUntilNext -= 3;
    if (weather.precipitation > 5) hoursUntilNext += 12;

    hoursUntilNext = Math.max(8, Math.min(72, hoursUntilNext));
    
    const nextDate = new Date();
    nextDate.setHours(nextDate.getHours() + hoursUntilNext);
    return nextDate;
  }

  private generateExplanation(weather: WeatherData, soil: SoilData, crop: CropData, 
                            weatherFactor: number, soilFactor: number, cropFactor: number): string {
    const reasons: string[] = [];

    if (weather.temperature > 30) reasons.push('température élevée');
    if (weather.humidity < 50) reasons.push('air sec');
    if (soil.moisture < 30) reasons.push('sol sec');
    if (crop.stage === 'floraison') reasons.push('phase de floraison');
    if (weather.precipitation < 1 && new Date().getHours() > 6) reasons.push('absence de pluie');

    if (reasons.length === 0) reasons.push('conditions optimales');

    return `Recommandation basée sur : ${reasons.join(', ')}. Culture ${crop.type} en ${crop.stage} sur ${crop.area}m².`;
  }

  private async simulateMLProcessing(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const smartMLService = new SmartMLService();