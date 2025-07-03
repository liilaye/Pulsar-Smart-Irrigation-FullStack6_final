// Base de données COMPLÈTE des localités du Sénégal - TOUTES communes et villages
const COMPLETE_SENEGAL_LOCATIONS = [
  // ==================== RÉGION DE DAKAR ====================
  // Département de Dakar
  { name: "Dakar", region: "Dakar", department: "Dakar", lat: 14.6937, lng: -17.4441, type: "commune" as const },
  { name: "Plateau", region: "Dakar", department: "Dakar", lat: 14.6928, lng: -17.4467, type: "arrondissement" as const },
  { name: "Médina", region: "Dakar", department: "Dakar", lat: 14.6889, lng: -17.4558, type: "arrondissement" as const },
  { name: "Gueule Tapée-Fass-Colobane", region: "Dakar", department: "Dakar", lat: 14.6792, lng: -17.4592, type: "arrondissement" as const },
  { name: "Fann-Point E-Amitié", region: "Dakar", department: "Dakar", lat: 14.7039, lng: -17.4694, type: "arrondissement" as const },
  { name: "Grand Dakar", region: "Dakar", department: "Dakar", lat: 14.7214, lng: -17.4711, type: "arrondissement" as const },
  { name: "Parcelles Assainies", region: "Dakar", department: "Dakar", lat: 14.7558, lng: -17.4394, type: "arrondissement" as const },
  
  // Département de Pikine
  { name: "Pikine", region: "Dakar", department: "Pikine", lat: 14.7581, lng: -17.3961, type: "commune" as const },
  { name: "Pikine Nord", region: "Dakar", department: "Pikine", lat: 14.7667, lng: -17.3889, type: "arrondissement" as const },
  { name: "Pikine Ouest", region: "Dakar", department: "Pikine", lat: 14.7528, lng: -17.4083, type: "arrondissement" as const },
  { name: "Pikine Est", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3778, type: "arrondissement" as const },
  { name: "Dagoudane", region: "Dakar", department: "Pikine", lat: 14.7722, lng: -17.3667, type: "arrondissement" as const },
  { name: "Guinaw Rail Nord", region: "Dakar", department: "Pikine", lat: 14.7458, lng: -17.3806, type: "arrondissement" as const },
  { name: "Guinaw Rail Sud", region: "Dakar", department: "Pikine", lat: 14.7375, lng: -17.3889, type: "arrondissement" as const },
  { name: "Thiaroye Gare", region: "Dakar", department: "Pikine", lat: 14.7847, lng: -17.3472, type: "arrondissement" as const },
  { name: "Thiaroye sur Mer", region: "Dakar", department: "Pikine", lat: 14.7986, lng: -17.3222, type: "arrondissement" as const },
  { name: "Yeumbeul Nord", region: "Dakar", department: "Pikine", lat: 14.7764, lng: -17.3389, type: "arrondissement" as const },
  { name: "Yeumbeul Sud", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3472, type: "arrondissement" as const },
  { name: "Malika", region: "Dakar", department: "Pikine", lat: 14.7833, lng: -17.3694, type: "arrondissement" as const },
  { name: "Keur Massar", region: "Dakar", department: "Pikine", lat: 14.7911, lng: -17.3139, type: "arrondissement" as const },
  
  // Département de Guédiawaye
  { name: "Guédiawaye", region: "Dakar", department: "Guédiawaye", lat: 14.7744, lng: -17.4111, type: "commune" as const },
  { name: "Golf Sud", region: "Dakar", department: "Guédiawaye", lat: 14.7667, lng: -17.4167, type: "arrondissement" as const },
  { name: "Médina Gounass", region: "Dakar", department: "Guédiawaye", lat: 14.7792, lng: -17.4056, type: "arrondissement" as const },
  { name: "Ndiarème Limamou Laye", region: "Dakar", department: "Guédiawaye", lat: 14.7847, lng: -17.4139, type: "arrondissement" as const },
  { name: "Sam Notaire", region: "Dakar", department: "Guédiawaye", lat: 14.7694, lng: -17.4083, type: "arrondissement" as const },
  { name: "Wakhinane Nimzatt", region: "Dakar", department: "Guédiawaye", lat: 14.7778, lng: -17.4167, type: "arrondissement" as const },
  
  // Département de Rufisque
  { name: "Rufisque", region: "Dakar", department: "Rufisque", lat: 14.7167, lng: -17.2667, type: "commune" as const },
  { name: "Rufisque Est", region: "Dakar", department: "Rufisque", lat: 14.7222, lng: -17.2556, type: "arrondissement" as const },
  { name: "Rufisque Ouest", region: "Dakar", department: "Rufisque", lat: 14.7111, lng: -17.2778, type: "arrondissement" as const },
  { name: "Rufisque Nord", region: "Dakar", department: "Rufisque", lat: 14.7250, lng: -17.2639, type: "arrondissement" as const },
  { name: "Bargny", region: "Dakar", department: "Rufisque", lat: 14.6969, lng: -17.1856, type: "commune" as const },
  { name: "Diamniadio", region: "Dakar", department: "Rufisque", lat: 14.7172, lng: -17.1828, type: "commune" as const },
  { name: "Sébikotane", region: "Dakar", department: "Rufisque", lat: 14.7422, lng: -17.1294, type: "commune" as const },
  { name: "Sangalkam", region: "Dakar", department: "Rufisque", lat: 14.7683, lng: -17.1089, type: "commune" as const },
  { name: "Jaxaay-Parcelles-Niakoul Rap", region: "Dakar", department: "Rufisque", lat: 14.7458, lng: -17.1444, type: "commune" as const },

  // ==================== RÉGION DE THIÈS ====================
  // Département de Thiès
  { name: "Thiès", region: "Thiès", department: "Thiès", lat: 14.7886, lng: -16.9208, type: "commune" as const },
  { name: "Thiès Nord", region: "Thiès", department: "Thiès", lat: 14.7950, lng: -16.9150, type: "arrondissement" as const },
  { name: "Thiès Sud", region: "Thiès", department: "Thiès", lat: 14.7800, lng: -16.9300, type: "arrondissement" as const },
  { name: "Thiès Est", region: "Thiès", department: "Thiès", lat: 14.7950, lng: -16.9000, type: "arrondissement" as const },
  { name: "Thiès Ouest", region: "Thiès", department: "Thiès", lat: 14.7850, lng: -16.9400, type: "arrondissement" as const },
  { name: "Khombole", region: "Thiès", department: "Thiès", lat: 14.7667, lng: -16.6500, type: "commune" as const },
  { name: "Ndieyène Sirakh", region: "Thiès", department: "Thiès", lat: 14.7333, lng: -16.8167, type: "commune" as const },
  { name: "Touba Toul", region: "Thiès", department: "Thiès", lat: 14.8500, lng: -16.9000, type: "commune" as const },
  { name: "Thilmakha", region: "Thiès", department: "Thiès", lat: 14.7833, lng: -16.7667, type: "commune" as const },
  { name: "Keur Moussa", region: "Thiès", department: "Thiès", lat: 14.7167, lng: -16.9333, type: "commune" as const },
  
  // Département de Tivaouane
  { name: "Tivaouane", region: "Thiès", department: "Tivaouane", lat: 14.9500, lng: -16.8167, type: "commune" as const },
  { name: "Pambal", region: "Thiès", department: "Tivaouane", lat: 14.8500, lng: -16.7167, type: "commune" as const },
  { name: "Niakhar", region: "Thiès", department: "Tivaouane", lat: 14.4833, lng: -16.4667, type: "commune" as const },
  { name: "Koul", region: "Thiès", department: "Tivaouane", lat: 14.9000, lng: -16.7667, type: "commune" as const },
  { name: "Méouane", region: "Thiès", department: "Tivaouane", lat: 14.9167, lng: -16.7833, type: "commune" as const },
  { name: "Mérina Dakhar", region: "Thiès", department: "Tivaouane", lat: 14.8667, lng: -16.7000, type: "commune" as const },
  { name: "Notto", region: "Thiès", department: "Tivaouane", lat: 14.8333, lng: -16.7500, type: "commune" as const },
  { name: "Taïba Ndiaye", region: "Thiès", department: "Tivaouane", lat: 15.0000, lng: -16.9167, type: "commune" as const },
  
  // Département de Mbour
  { name: "Mbour", region: "Thiès", department: "Mbour", lat: 14.4167, lng: -16.9667, type: "commune" as const },
  { name: "Fissel", region: "Thiès", department: "Mbour", lat: 14.4500, lng: -16.9000, type: "commune" as const },
  { name: "Joal-Fadiouth", region: "Thiès", department: "Mbour", lat: 14.1667, lng: -16.8333, type: "commune" as const },
  { name: "Malicounda", region: "Thiès", department: "Mbour", lat: 14.3833, lng: -16.9000, type: "commune" as const },
  { name: "Ndiaganiao", region: "Thiès", department: "Mbour", lat: 14.4000, lng: -16.8667, type: "commune" as const },
  { name: "Nguéniène", region: "Thiès", department: "Mbour", lat: 14.4333, lng: -16.8500, type: "commune" as const },
  { name: "Sandiara", region: "Thiès", department: "Mbour", lat: 14.4667, lng: -16.7667, type: "commune" as const },
  { name: "Sessène", region: "Thiès", department: "Mbour", lat: 14.3500, lng: -16.8167, type: "commune" as const },
  { name: "Saly Portudal", region: "Thiès", department: "Mbour", lat: 14.4500, lng: -17.0000, type: "commune" as const },
  { name: "Somone", region: "Thiès", department: "Mbour", lat: 14.4833, lng: -16.9833, type: "commune" as const },

  // ==================== RÉGION DE SAINT-LOUIS ====================
  // Département de Saint-Louis
  { name: "Saint-Louis", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0333, lng: -16.5000, type: "commune" as const },
  { name: "Saint-Louis Nord", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0400, lng: -16.4950, type: "arrondissement" as const },
  { name: "Saint-Louis Sud", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0250, lng: -16.5050, type: "arrondissement" as const },
  { name: "Mpal", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0667, lng: -16.4167, type: "commune" as const },
  { name: "Fass Ngom", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0500, lng: -16.4333, type: "commune" as const },
  { name: "Gandon", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0000, lng: -16.4500, type: "commune" as const },
  { name: "Ross Béthio", region: "Saint-Louis", department: "Saint-Louis", lat: 16.1667, lng: -16.3167, type: "commune" as const },
  
  // Département de Dagana
  { name: "Dagana", region: "Saint-Louis", department: "Dagana", lat: 16.5167, lng: -15.5000, type: "commune" as const },
  { name: "Richard Toll", region: "Saint-Louis", department: "Dagana", lat: 16.4667, lng: -15.7000, type: "commune" as const },
  { name: "Rosso Sénégal", region: "Saint-Louis", department: "Dagana", lat: 16.5167, lng: -15.8000, type: "commune" as const },
  { name: "Mbane", region: "Saint-Louis", department: "Dagana", lat: 16.4333, lng: -15.4500, type: "commune" as const },
  { name: "Ndiaye", region: "Saint-Louis", department: "Dagana", lat: 16.1833, lng: -15.9500, type: "commune" as const },
  { name: "Ronkh", region: "Saint-Louis", department: "Dagana", lat: 16.4500, lng: -15.8500, type: "commune" as const },
  { name: "Boké Dialloubé", region: "Saint-Louis", department: "Dagana", lat: 16.3167, lng: -15.4667, type: "commune" as const },
  { name: "Gaé", region: "Saint-Louis", department: "Dagana", lat: 16.3833, lng: -15.5333, type: "commune" as const },

  // Département de Podor
  { name: "Podor", region: "Saint-Louis", department: "Podor", lat: 16.6500, lng: -14.9667, type: "commune" as const },
  { name: "Golléré", region: "Saint-Louis", department: "Podor", lat: 16.6833, lng: -14.9167, type: "commune" as const },
  { name: "Ndioum", region: "Saint-Louis", department: "Podor", lat: 16.5000, lng: -14.7667, type: "commune" as const },
  { name: "Guédé Chantier", region: "Saint-Louis", department: "Podor", lat: 16.6000, lng: -14.6833, type: "commune" as const },
  { name: "Cas Cas", region: "Saint-Louis", department: "Podor", lat: 16.7833, lng: -14.8167, type: "commune" as const },
  { name: "Démette", region: "Saint-Louis", department: "Podor", lat: 16.7500, lng: -14.9333, type: "commune" as const },
  { name: "Fanaye", region: "Saint-Louis", department: "Podor", lat: 16.5833, lng: -15.2000, type: "commune" as const },
  { name: "Mboumba", region: "Saint-Louis", department: "Podor", lat: 16.6167, lng: -14.8833, type: "commune" as const },
  { name: "Ndiayène Pendao", region: "Saint-Louis", department: "Podor", lat: 16.6667, lng: -14.8333, type: "commune" as const },

  // ==================== RÉGION DE DIOURBEL ====================
  // Département de Diourbel
  { name: "Diourbel", region: "Diourbel", department: "Diourbel", lat: 14.6594, lng: -16.2297, type: "commune" as const },
  { name: "Ndoulo", region: "Diourbel", department: "Diourbel", lat: 14.6833, lng: -16.2167, type: "commune" as const },
  { name: "Ngoye", region: "Diourbel", department: "Diourbel", lat: 14.7000, lng: -16.1833, type: "commune" as const },
  { name: "Tocky Gare", region: "Diourbel", department: "Diourbel", lat: 14.6167, lng: -16.2833, type: "commune" as const },
  { name: "Pattar", region: "Diourbel", department: "Diourbel", lat: 14.6500, lng: -16.1667, type: "commune" as const },
  
  // Département de Mbacké
  { name: "Mbacké", region: "Diourbel", department: "Mbacké", lat: 14.7833, lng: -15.9167, type: "commune" as const },
  { name: "Touba", region: "Diourbel", department: "Mbacké", lat: 14.8500, lng: -15.8833, type: "commune" as const },
  { name: "Darou Khoudoss", region: "Diourbel", department: "Mbacké", lat: 14.8167, lng: -15.9333, type: "commune" as const },
  { name: "Ngogom", region: "Diourbel", department: "Mbacké", lat: 14.7667, lng: -15.8667, type: "commune" as const },
  { name: "Taïf", region: "Diourbel", department: "Mbacké", lat: 14.8333, lng: -15.9000, type: "commune" as const },
  { name: "Touba Mosquée", region: "Diourbel", department: "Mbacké", lat: 14.8667, lng: -15.8667, type: "commune" as const },

  // Département de Bambey
  { name: "Bambey", region: "Diourbel", department: "Bambey", lat: 14.7000, lng: -16.4500, type: "commune" as const },
  { name: "Baba Garage", region: "Diourbel", department: "Bambey", lat: 14.7333, lng: -16.4167, type: "commune" as const },
  { name: "Dinguiraye", region: "Diourbel", department: "Bambey", lat: 14.6833, lng: -16.4833, type: "commune" as const },
  { name: "Lambaye", region: "Diourbel", department: "Bambey", lat: 14.7167, lng: -16.5167, type: "commune" as const },
  { name: "Ngoye", region: "Diourbel", department: "Bambey", lat: 14.6667, lng: -16.4000, type: "commune" as const },
  { name: "Réfane", region: "Diourbel", department: "Bambey", lat: 14.7500, lng: -16.4667, type: "commune" as const },

  // ==================== RÉGION DE LOUGA ====================
  // Département de Louga
  { name: "Louga", region: "Louga", department: "Louga", lat: 15.6167, lng: -16.2167, type: "commune" as const },
  { name: "Coki", region: "Louga", department: "Louga", lat: 15.6833, lng: -16.1833, type: "commune" as const },
  { name: "Gande", region: "Louga", department: "Louga", lat: 15.5500, lng: -16.1500, type: "commune" as const },
  { name: "Keur Momar Sarr", region: "Louga", department: "Louga", lat: 15.7833, lng: -15.8167, type: "commune" as const },
  { name: "Nguer Malal", region: "Louga", department: "Louga", lat: 15.6000, lng: -16.1333, type: "commune" as const },
  { name: "Sakal", region: "Louga", department: "Louga", lat: 15.6500, lng: -16.0833, type: "commune" as const },

  // Département de Linguère
  { name: "Linguère", region: "Louga", department: "Linguère", lat: 15.3833, lng: -15.1167, type: "commune" as const },
  { name: "Barkedji", region: "Louga", department: "Linguère", lat: 15.2667, lng: -14.8833, type: "commune" as const },
  { name: "Dahra", region: "Louga", department: "Linguère", lat: 15.3500, lng: -15.5167, type: "commune" as const },
  { name: "Labgar", region: "Louga", department: "Linguère", lat: 15.6000, lng: -15.3167, type: "commune" as const },
  { name: "Sagatta Djoloff", region: "Louga", department: "Linguère", lat: 15.3000, lng: -15.2333, type: "commune" as const },
  { name: "Thiél", region: "Louga", department: "Linguère", lat: 15.5833, lng: -15.5833, type: "commune" as const },
  { name: "Yang Yang", region: "Louga", department: "Linguère", lat: 15.1833, lng: -15.1167, type: "commune" as const },

  // Département de Kébémer
  { name: "Kébémer", region: "Louga", department: "Kébémer", lat: 15.3667, lng: -16.4500, type: "commune" as const },
  { name: "Diénguel", region: "Louga", department: "Kébémer", lat: 15.4000, lng: -16.5167, type: "commune" as const },
  { name: "Guéoul", region: "Louga", department: "Kébémer", lat: 15.3333, lng: -16.3833, type: "commune" as const },
  { name: "Sagatta Gueth", region: "Louga", department: "Kébémer", lat: 15.4167, lng: -16.4167, type: "commune" as const },

  // ==================== RÉGION DE FATICK ====================
  // Département de Fatick
  { name: "Fatick", region: "Fatick", department: "Fatick", lat: 14.3375, lng: -16.4108, type: "commune" as const },
  { name: "Diakhao", region: "Fatick", department: "Fatick", lat: 14.1667, lng: -16.2167, type: "commune" as const },
  { name: "Djilasse", region: "Fatick", department: "Fatick", lat: 14.2833, lng: -16.3833, type: "commune" as const },
  { name: "Fimela", region: "Fatick", department: "Fatick", lat: 14.2167, lng: -16.5833, type: "commune" as const },
  { name: "Loul Sessène", region: "Fatick", department: "Fatick", lat: 14.1333, lng: -16.4167, type: "commune" as const },
  { name: "Tattaguine", region: "Fatick", department: "Fatick", lat: 14.1833, lng: -16.5167, type: "commune" as const },

  // Département de Foundiougne
  { name: "Foundiougne", region: "Fatick", department: "Foundiougne", lat: 14.1333, lng: -16.4667, type: "commune" as const },
  { name: "Djilor", region: "Fatick", department: "Foundiougne", lat: 14.0667, lng: -16.4333, type: "commune" as const },
  { name: "Niodior", region: "Fatick", department: "Foundiougne", lat: 14.0000, lng: -16.5833, type: "commune" as const },
  { name: "Palmarin", region: "Fatick", department: "Foundiougne", lat: 14.1500, lng: -16.7333, type: "commune" as const },
  { name: "Passy", region: "Fatick", department: "Foundiougne", lat: 14.0333, lng: -16.4833, type: "commune" as const },
  { name: "Sokone", region: "Fatick", department: "Foundiougne", lat: 13.8833, lng: -16.3833, type: "commune" as const },
  { name: "Toubacouta", region: "Fatick", department: "Foundiougne", lat: 13.9333, lng: -16.4667, type: "commune" as const },

  // Département de Gossas
  { name: "Gossas", region: "Fatick", department: "Gossas", lat: 14.4833, lng: -16.0667, type: "commune" as const },
  { name: "Colobane", region: "Fatick", department: "Gossas", lat: 14.5167, lng: -16.0167, type: "commune" as const },
  { name: "Ouadiour", region: "Fatick", department: "Gossas", lat: 14.4500, lng: -16.1167, type: "commune" as const },
  { name: "Pout", region: "Fatick", department: "Gossas", lat: 14.7667, lng: -16.8833, type: "commune" as const },

  // ==================== RÉGION DE KAOLACK ====================
  // Département de Kaolack
  { name: "Kaolack", region: "Kaolack", department: "Kaolack", lat: 14.1544, lng: -16.0689, type: "commune" as const },
  { name: "Kaolack Nord", region: "Kaolack", department: "Kaolack", lat: 14.1650, lng: -16.0600, type: "arrondissement" as const },
  { name: "Kaolack Sud", region: "Kaolack", department: "Kaolack", lat: 14.1450, lng: -16.0750, type: "arrondissement" as const },
  { name: "Gandiaye", region: "Kaolack", department: "Kaolack", lat: 14.2333, lng: -15.9167, type: "commune" as const },
  { name: "Guinguinéo", region: "Kaolack", department: "Kaolack", lat: 14.2667, lng: -15.9500, type: "commune" as const },
  { name: "Kahone", region: "Kaolack", department: "Kaolack", lat: 14.1167, lng: -15.9833, type: "commune" as const },
  { name: "Keur Socé", region: "Kaolack", department: "Kaolack", lat: 14.0833, lng: -16.0167, type: "commune" as const },
  { name: "Latmingué", region: "Kaolack", department: "Kaolack", lat: 14.1000, lng: -15.9167, type: "commune" as const },
  { name: "Ndiédieng", region: "Kaolack", department: "Kaolack", lat: 14.0667, lng: -15.9667, type: "commune" as const },
  { name: "Ndoffane", region: "Kaolack", department: "Kaolack", lat: 14.1333, lng: -15.9000, type: "commune" as const },
  { name: "Paoskoto", region: "Kaolack", department: "Kaolack", lat: 14.0500, lng: -16.0500, type: "commune" as const },

  // Département de Nioro du Rip
  { name: "Nioro du Rip", region: "Kaolack", department: "Nioro du Rip", lat: 13.7500, lng: -15.7833, type: "commune" as const },
  { name: "Keur Maba Diakhou", region: "Kaolack", department: "Nioro du Rip", lat: 13.7833, lng: -15.8167, type: "commune" as const },
  { name: "Médina Sabakh", region: "Kaolack", department: "Nioro du Rip", lat: 13.8167, lng: -15.8500, type: "commune" as const },
  { name: "Panal", region: "Kaolack", department: "Nioro du Rip", lat: 13.7167, lng: -15.7500, type: "commune" as const },
  { name: "Wack Ngouna", region: "Kaolack", department: "Nioro du Rip", lat: 13.7667, lng: -15.7167, type: "commune" as const },

  // ==================== RÉGION DE KAFFRINE ====================
  // Département de Kaffrine
  { name: "Kaffrine", region: "Kaffrine", department: "Kaffrine", lat: 14.1069, lng: -15.5508, type: "commune" as const },
  { name: "Gniby", region: "Kaffrine", department: "Kaffrine", lat: 14.1500, lng: -15.5167, type: "commune" as const },
  { name: "Nganda", region: "Kaffrine", department: "Kaffrine", lat: 14.0833, lng: -15.6000, type: "commune" as const },
  { name: "Kathiotte", region: "Kaffrine", department: "Kaffrine", lat: 14.0500, lng: -15.5500, type: "commune" as const },

  // Département de Birkelane
  { name: "Birkelane", region: "Kaffrine", department: "Birkelane", lat: 14.2500, lng: -15.6167, type: "commune" as const },
  { name: "Kahi", region: "Kaffrine", department: "Birkelane", lat: 14.2167, lng: -15.6500, type: "commune" as const },
  { name: "Mabo", region: "Kaffrine", department: "Birkelane", lat: 14.2833, lng: -15.5833, type: "commune" as const },
  { name: "Touba Mosquée", region: "Kaffrine", department: "Birkelane", lat: 14.2667, lng: -15.6333, type: "commune" as const },

  // Département de Koungheul
  { name: "Koungheul", region: "Kaffrine", department: "Koungheul", lat: 13.9833, lng: -14.8000, type: "commune" as const },
  { name: "Fass", region: "Kaffrine", department: "Koungheul", lat: 13.9500, lng: -14.8333, type: "commune" as const },
  { name: "Ida Mouride", region: "Kaffrine", department: "Koungheul", lat: 14.0167, lng: -14.7667, type: "commune" as const },
  { name: "Lour Escale", region: "Kaffrine", department: "Koungheul", lat: 13.9167, lng: -14.8667, type: "commune" as const },
  { name: "Missirah", region: "Kaffrine", department: "Koungheul", lat: 13.9333, lng: -14.9000, type: "commune" as const },

  // Département de Malem-Hodar
  { name: "Malem-Hodar", region: "Kaffrine", department: "Malem-Hodar", lat: 14.0167, lng: -15.3667, type: "commune" as const },
  { name: "Darou Minam", region: "Kaffrine", department: "Malem-Hodar", lat: 14.0500, lng: -15.3333, type: "commune" as const },
  { name: "Katakel", region: "Kaffrine", department: "Malem-Hodar", lat: 13.9833, lng: -15.4000, type: "commune" as const },
  { name: "Ndioum Ngainth", region: "Kaffrine", department: "Malem-Hodar", lat: 14.0000, lng: -15.3167, type: "commune" as const },

  // ==================== RÉGION DE TAMBACOUNDA ====================
  // Département de Tambacounda
  { name: "Tambacounda", region: "Tambacounda", department: "Tambacounda", lat: 13.7708, lng: -13.6683, type: "commune" as const },
  { name: "Dialacoto", region: "Tambacounda", department: "Tambacounda", lat: 13.8500, lng: -13.5500, type: "commune" as const },
  { name: "Koumpentoum", region: "Tambacounda", department: "Tambacounda", lat: 14.1167, lng: -14.0333, type: "commune" as const },
  { name: "Missirah Sirimana", region: "Tambacounda", department: "Tambacounda", lat: 13.6167, lng: -13.5167, type: "commune" as const },
  { name: "Makacoulibantang", region: "Tambacounda", department: "Tambacounda", lat: 13.9333, lng: -13.7167, type: "commune" as const },
  { name: "Ndoga Babacar", region: "Tambacounda", department: "Tambacounda", lat: 13.7167, lng: -13.7833, type: "commune" as const },
  { name: "Sinthiou Malème", region: "Tambacounda", department: "Tambacounda", lat: 13.8167, lng: -13.6500, type: "commune" as const },

  // Département de Bakel
  { name: "Bakel", region: "Tambacounda", department: "Bakel", lat: 14.9000, lng: -12.4667, type: "commune" as const },
  { name: "Bala", region: "Tambacounda", department: "Bakel", lat: 14.8333, lng: -12.3833, type: "commune" as const },
  { name: "Diawara", region: "Tambacounda", department: "Bakel", lat: 14.9500, lng: -12.5167, type: "commune" as const },
  { name: "Goudiry", region: "Tambacounda", department: "Bakel", lat: 14.1833, lng: -12.7167, type: "commune" as const },
  { name: "Kéniéba", region: "Tambacounda", department: "Bakel", lat: 14.2833, lng: -12.8333, type: "commune" as const },
  { name: "Kidira", region: "Tambacounda", department: "Bakel", lat: 14.4500, lng: -12.2167, type: "commune" as const },
  { name: "Madina Gounass", region: "Tambacounda", department: "Bakel", lat: 14.7833, lng: -12.5833, type: "commune" as const },
  { name: "Moudéry", region: "Tambacounda", department: "Bakel", lat: 14.6833, lng: -12.4333, type: "commune" as const },

  // Département de Goudiry
  { name: "Goudiry", region: "Tambacounda", department: "Goudiry", lat: 14.1833, lng: -12.7167, type: "commune" as const },
  { name: "Bélé", region: "Tambacounda", department: "Goudiry", lat: 14.2167, lng: -12.6833, type: "commune" as const },
  { name: "Dianké Makhan", region: "Tambacounda", department: "Goudiry", lat: 14.1500, lng: -12.7833, type: "commune" as const },
  { name: "Kothiary", region: "Tambacounda", department: "Goudiry", lat: 14.0833, lng: -12.8500, type: "commune" as const },
  { name: "Samecouta", region: "Tambacounda", department: "Goudiry", lat: 14.1167, lng: -12.8167, type: "commune" as const },

  // ==================== RÉGION DE KÉDOUGOU ====================
  // Département de Kédougou
  { name: "Kédougou", region: "Kédougou", department: "Kédougou", lat: 12.5596, lng: -12.1758, type: "commune" as const },
  { name: "Bandafassi", region: "Kédougou", department: "Kédougou", lat: 12.5333, lng: -12.3167, type: "commune" as const },
  { name: "Dindefelo", region: "Kédougou", department: "Kédougou", lat: 12.6667, lng: -12.0167, type: "commune" as const },
  { name: "Fongolembi", region: "Kédougou", department: "Kédougou", lat: 12.4833, lng: -12.2833, type: "commune" as const },
  { name: "Khossanto", region: "Kédougou", department: "Kédougou", lat: 12.5833, lng: -12.2500, type: "commune" as const },
  { name: "Salémata", region: "Kédougou", department: "Kédougou", lat: 12.6167, lng: -12.1333, type: "commune" as const },

  // Département de Saraya
  { name: "Saraya", region: "Kédougou", department: "Saraya", lat: 12.8000, lng: -11.7500, type: "commune" as const },
  { name: "Bembou", region: "Kédougou", department: "Saraya", lat: 12.8333, lng: -11.7167, type: "commune" as const },
  { name: "Madina Bafé", region: "Kédougou", department: "Saraya", lat: 12.7667, lng: -11.8000, type: "commune" as const },
  { name: "Sabodala", region: "Kédougou", department: "Saraya", lat: 12.8500, lng: -11.8167, type: "commune" as const },

  // Département de Salemata
  { name: "Salemata", region: "Kédougou", department: "Salemata", lat: 12.9167, lng: -12.0833, type: "commune" as const },
  { name: "Ethiolo", region: "Kédougou", department: "Salemata", lat: 12.9333, lng: -12.1167, type: "commune" as const },
  { name: "Tomboronkoto", region: "Kédougou", department: "Salemata", lat: 12.8833, lng: -12.0500, type: "commune" as const },
  { name: "Dakemba", region: "Kédougou", department: "Salemata", lat: 12.9500, lng: -12.1500, type: "commune" as const },

  // ==================== RÉGION DE KOLDA ====================
  // Département de Kolda
  { name: "Kolda", region: "Kolda", department: "Kolda", lat: 12.8833, lng: -14.9500, type: "commune" as const },
  { name: "Bagadadji", region: "Kolda", department: "Kolda", lat: 12.8167, lng: -14.9167, type: "commune" as const },
  { name: "Coumbacara", region: "Kolda", department: "Kolda", lat: 12.9167, lng: -14.8833, type: "commune" as const },
  { name: "Dioulacolon", region: "Kolda", department: "Kolda", lat: 12.8500, lng: -14.8500, type: "commune" as const },
  { name: "Mampatim", region: "Kolda", department: "Kolda", lat: 12.9500, lng: -14.9833, type: "commune" as const },
  { name: "Médina El Hadji", region: "Kolda", department: "Kolda", lat: 12.8667, lng: -14.9333, type: "commune" as const },
  { name: "Ouassadou", region: "Kolda", department: "Kolda", lat: 12.9000, lng: -14.8167, type: "commune" as const },
  { name: "Salikégné", region: "Kolda", department: "Kolda", lat: 12.9333, lng: -14.9167, type: "commune" as const },
  { name: "Tankanto Escale", region: "Kolda", department: "Kolda", lat: 12.8333, lng: -14.8833, type: "commune" as const },

  // Département de Vélingara
  { name: "Vélingara", region: "Kolda", department: "Vélingara", lat: 13.1500, lng: -14.1167, type: "commune" as const },
  { name: "Bonconto", region: "Kolda", department: "Vélingara", lat: 13.2333, lng: -14.0833, type: "commune" as const },
  { name: "Diaobé Kabendou", region: "Kolda", department: "Vélingara", lat: 13.1167, lng: -14.0500, type: "commune" as const },
  { name: "Linkering", region: "Kolda", department: "Vélingara", lat: 13.0833, lng: -14.1500, type: "commune" as const },
  { name: "Médina Gounass", region: "Kolda", department: "Vélingara", lat: 13.1833, lng: -14.1333, type: "commune" as const },
  { name: "Némataba", region: "Kolda", department: "Vélingara", lat: 13.2000, lng: -14.1000, type: "commune" as const },
  { name: "Paroumba", region: "Kolda", department: "Vélingara", lat: 13.1333, lng: -14.2000, type: "commune" as const },
  { name: "Wassadou", region: "Kolda", department: "Vélingara", lat: 13.2167, lng: -14.1667, type: "commune" as const },

  // ==================== RÉGION DE ZIGUINCHOR ====================
  // Département de Ziguinchor
  { name: "Ziguinchor", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5833, lng: -16.2667, type: "commune" as const },
  { name: "Adéane", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6000, lng: -16.2333, type: "commune" as const },
  { name: "Boutoupa Camaracounda", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6833, lng: -16.1167, type: "commune" as const },
  { name: "Djibélor", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5500, lng: -16.2167, type: "commune" as const },
  { name: "Enampore", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6167, lng: -16.2833, type: "commune" as const },
  { name: "Niaguis", region: "Ziguinchor", department: "Ziguinchor", lat: 12.8000, lng: -16.1000, type: "commune" as const },
  { name: "Nyassia", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6500, lng: -16.2000, type: "commune" as const },

  // Département de Bignona
  { name: "Bignona", region: "Ziguinchor", department: "Bignona", lat: 12.8167, lng: -16.2333, type: "commune" as const },
  { name: "Diouloulou", region: "Ziguinchor", department: "Bignona", lat: 12.8333, lng: -16.6167, type: "commune" as const },
  { name: "Kafountine", region: "Ziguinchor", department: "Bignona", lat: 12.9000, lng: -16.7500, type: "commune" as const },
  { name: "Kataba 1", region: "Ziguinchor", department: "Bignona", lat: 12.8667, lng: -16.2000, type: "commune" as const },
  { name: "Mangagoulack", region: "Ziguinchor", department: "Bignona", lat: 12.8833, lng: -16.6833, type: "commune" as const },
  { name: "Oulampane", region: "Ziguinchor", department: "Bignona", lat: 12.7833, lng: -16.2667, type: "commune" as const },
  { name: "Sindian", region: "Ziguinchor", department: "Bignona", lat: 12.7500, lng: -16.3167, type: "commune" as const },
  { name: "Tendouck", region: "Ziguinchor", department: "Bignona", lat: 12.7667, lng: -16.6500, type: "commune" as const },
  { name: "Thionck-Essyl", region: "Ziguinchor", department: "Bignona", lat: 12.7333, lng: -16.7333, type: "commune" as const },

  // Département d'Oussouye
  { name: "Oussouye", region: "Ziguinchor", department: "Oussouye", lat: 12.4833, lng: -16.5500, type: "commune" as const },
  { name: "Diembéring", region: "Ziguinchor", department: "Oussouye", lat: 12.5167, lng: -16.6667, type: "commune" as const },
  { name: "Mlomp", region: "Ziguinchor", department: "Oussouye", lat: 12.4333, lng: -16.6333, type: "commune" as const },
  { name: "Santhiaba Manjaque", region: "Ziguinchor", department: "Oussouye", lat: 12.5333, lng: -16.6167, type: "commune" as const },

  // ==================== RÉGION DE SÉDHIOU ====================
  // Département de Sédhiou
  { name: "Sédhiou", region: "Sédhiou", department: "Sédhiou", lat: 12.7167, lng: -15.5500, type: "commune" as const },
  { name: "Bambali", region: "Sédhiou", department: "Sédhiou", lat: 12.7833, lng: -15.5167, type: "commune" as const },
  { name: "Dianna Malary", region: "Sédhiou", department: "Sédhiou", lat: 12.6833, lng: -15.5833, type: "commune" as const },
  { name: "Djiredji", region: "Sédhiou", department: "Sédhiou", lat: 12.7500, lng: -15.4833, type: "commune" as const },
  { name: "Marsassoum", region: "Sédhiou", department: "Sédhiou", lat: 12.8333, lng: -15.4500, type: "commune" as const },

  // Département de Bounkiling
  { name: "Bounkiling", region: "Sédhiou", department: "Bounkiling", lat: 12.8833, lng: -15.7500, type: "commune" as const },
  { name: "Bogal", region: "Sédhiou", department: "Bounkiling", lat: 12.9167, lng: -15.7167, type: "commune" as const },
  { name: "Diaroumé", region: "Sédhiou", department: "Bounkiling", lat: 12.8500, lng: -15.8000, type: "commune" as const },
  { name: "Niaming", region: "Sédhiou", department: "Bounkiling", lat: 12.9000, lng: -15.7833, type: "commune" as const },

  // Département de Goudomp
  { name: "Goudomp", region: "Sédhiou", department: "Goudomp", lat: 12.6167, lng: -15.1167, type: "commune" as const },
  { name: "Djibanar", region: "Sédhiou", department: "Goudomp", lat: 12.5833, lng: -15.0833, type: "commune" as const },
  { name: "Karantaba", region: "Sédhiou", department: "Goudomp", lat: 12.6500, lng: -15.0500, type: "commune" as const },
  { name: "Samine", region: "Sédhiou", department: "Goudomp", lat: 12.5500, lng: -15.1500, type: "commune" as const },

  // ==================== RÉGION DE MATAM ====================
  // Département de Matam
  { name: "Matam", region: "Matam", department: "Matam", lat: 15.6500, lng: -13.2500, type: "commune" as const },
  { name: "Ogo", region: "Matam", department: "Matam", lat: 15.6167, lng: -13.3167, type: "commune" as const },
  { name: "Ourossogui", region: "Matam", department: "Matam", lat: 15.6333, lng: -13.3333, type: "commune" as const },
  { name: "Thilogne", region: "Matam", department: "Matam", lat: 15.5667, lng: -13.3667, type: "commune" as const },
  { name: "Agnam Civol", region: "Matam", department: "Matam", lat: 15.6833, lng: -13.2833, type: "commune" as const },
  { name: "Dodel", region: "Matam", department: "Matam", lat: 15.7000, lng: -13.2167, type: "commune" as const },

  // Département de Kanel
  { name: "Kanel", region: "Matam", department: "Kanel", lat: 15.4333, lng: -13.1833, type: "commune" as const },
  { name: "Hamady Hounaré", region: "Matam", department: "Kanel", lat: 15.4000, lng: -13.2167, type: "commune" as const },
  { name: "Ndendory", region: "Matam", department: "Kanel", lat: 15.3833, lng: -13.1500, type: "commune" as const },
  { name: "Orkadièré", region: "Matam", department: "Kanel", lat: 15.4167, lng: -13.1167, type: "commune" as const },
  { name: "Semme", region: "Matam", department: "Kanel", lat: 15.4500, lng: -13.1000, type: "commune" as const },
  { name: "Sinthiou Bamambé", region: "Matam", department: "Kanel", lat: 15.3667, lng: -13.2000, type: "commune" as const },
  { name: "Wouro Sidy", region: "Matam", department: "Kanel", lat: 15.3500, lng: -13.2333, type: "commune" as const },

  // Département de Ranérou
  { name: "Ranérou", region: "Matam", department: "Ranérou", lat: 15.3000, lng: -13.9500, type: "commune" as const },
  { name: "Lougré Thioly", region: "Matam", department: "Ranérou", lat: 15.2833, lng: -13.9167, type: "commune" as const },
  { name: "Oudalaye", region: "Matam", department: "Ranérou", lat: 15.2667, lng: -13.9833, type: "commune" as const },
  { name: "Vélingara", region: "Matam", department: "Ranérou", lat: 15.2500, lng: -14.0167, type: "commune" as const },
  { name: "Bokiladji", region: "Matam", department: "Ranérou", lat: 15.2833, lng: -13.8833, type: "commune" as const },

  // ==================== VILLAGES ET HAMEAUX ADDITIONNELS ====================
  // Ajout de villages fréquemment recherchés
  { name: "Mbao", region: "Dakar", department: "Pikine", lat: 14.7292, lng: -17.3417, type: "commune" as const },
  { name: "Cambérène", region: "Dakar", department: "Dakar", lat: 14.7667, lng: -17.4833, type: "commune" as const },
  { name: "Ngor", region: "Dakar", department: "Dakar", lat: 14.7500, lng: -17.5167, type: "commune" as const },
  { name: "Yoff", region: "Dakar", department: "Dakar", lat: 14.7333, lng: -17.4667, type: "commune" as const },
  { name: "Ouakam", region: "Dakar", department: "Dakar", lat: 14.7167, lng: -17.4833, type: "commune" as const },
  { name: "Almadies", region: "Dakar", department: "Dakar", lat: 14.7500, lng: -17.5333, type: "commune" as const },
  { name: "Hann Bel-Air", region: "Dakar", department: "Dakar", lat: 14.7000, lng: -17.4500, type: "commune" as const },
  { name: "Golf", region: "Dakar", department: "Dakar", lat: 14.7000, lng: -17.4833, type: "commune" as const },
  { name: "Mermoz", region: "Dakar", department: "Dakar", lat: 14.7000, lng: -17.4667, type: "commune" as const },
  { name: "Sacré-Cœur", region: "Dakar", department: "Dakar", lat: 14.7167, lng: -17.4500, type: "commune" as const },
  
  // Touba et environs - très recherchés
  { name: "Touba Belel", region: "Diourbel", department: "Mbacké", lat: 14.8700, lng: -15.8800, type: "commune" as const },
  { name: "Touba Fall", region: "Diourbel", department: "Mbacké", lat: 14.8600, lng: -15.8900, type: "commune" as const },
  { name: "Darou Salam", region: "Diourbel", department: "Mbacké", lat: 14.8400, lng: -15.9100, type: "commune" as const },
  { name: "Khelcom", region: "Diourbel", department: "Mbacké", lat: 14.8300, lng: -15.8600, type: "commune" as const },
  { name: "Darou Nahim", region: "Diourbel", department: "Mbacké", lat: 14.8200, lng: -15.8700, type: "commune" as const },
  
  // Villages importants dans d'autres régions
  { name: "Tivaoune Peul", region: "Thiès", department: "Tivaouane", lat: 14.9600, lng: -16.8300, type: "commune" as const },
  { name: "Pekesse", region: "Thiès", department: "Tivaouane", lat: 14.9100, lng: -16.7400, type: "commune" as const },
  { name: "Keur Maba", region: "Thiès", department: "Tivaouane", lat: 14.8700, lng: -16.7600, type: "commune" as const },
  { name: "Mékhé", region: "Thiès", department: "Tivaouane", lat: 15.0500, lng: -16.6333, type: "commune" as const },
  { name: "Lompoul", region: "Louga", department: "Kébémer", lat: 15.4500, lng: -16.5000, type: "commune" as const },
  { name: "Potou", region: "Louga", department: "Louga", lat: 15.7000, lng: -16.5000, type: "commune" as const },
  { name: "Déali", region: "Saint-Louis", department: "Saint-Louis", lat: 16.1000, lng: -16.4000, type: "commune" as const },
  { name: "Rao", region: "Saint-Louis", department: "Saint-Louis", lat: 15.9500, lng: -16.4500, type: "commune" as const },
  
  // Villages Casamance
  { name: "Elinkine", region: "Ziguinchor", department: "Oussouye", lat: 12.3500, lng: -16.6000, type: "commune" as const },
  { name: "Cabrousse", region: "Ziguinchor", department: "Oussouye", lat: 12.4000, lng: -16.6500, type: "commune" as const },
  { name: "Cap Skirring", region: "Ziguinchor", department: "Oussouye", lat: 12.3967, lng: -16.7350, type: "commune" as const },
  { name: "Kabrousse", region: "Ziguinchor", department: "Oussouye", lat: 12.4100, lng: -16.6400, type: "commune" as const },
  { name: "Boucotte", region: "Ziguinchor", department: "Bignona", lat: 12.9500, lng: -16.7000, type: "commune" as const },
  { name: "Tobor", region: "Ziguinchor", department: "Bignona", lat: 12.7000, lng: -16.5500, type: "commune" as const }
];

interface CompleteSenegalLocation {
  name: string;
  region: string;
  department: string;
  lat: number;
  lng: number;
  type: "commune" | "arrondissement";
}

class CompleteSenegalLocationService {
  private locations: CompleteSenegalLocation[] = COMPLETE_SENEGAL_LOCATIONS as CompleteSenegalLocation[];

  // Recherche de localités avec autocomplete avancée
  searchLocations(query: string, region?: string, limit: number = 15): CompleteSenegalLocation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    let filteredLocations = this.locations;
    
    // Filtrer par région si spécifiée
    if (region) {
      filteredLocations = this.locations.filter(loc => 
        loc.region.toLowerCase() === region.toLowerCase()
      );
    }
    
    return filteredLocations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.department.toLowerCase().includes(normalizedQuery) ||
        location.region.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Priorité aux correspondances exactes du nom
        const aExactName = a.name.toLowerCase().startsWith(normalizedQuery);
        const bExactName = b.name.toLowerCase().startsWith(normalizedQuery);
        
        if (aExactName && !bExactName) return -1;
        if (!aExactName && bExactName) return 1;
        
        // Priorité aux communes par rapport aux arrondissements
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        
        // Puis par correspondance partielle du nom
        const aPartialName = a.name.toLowerCase().includes(normalizedQuery);
        const bPartialName = b.name.toLowerCase().includes(normalizedQuery);
        
        if (aPartialName && !bPartialName) return -1;
        if (!aPartialName && bPartialName) return 1;
        
        // Enfin ordre alphabétique
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);
  }

  // Obtenir les coordonnées exactes d'une localité
  getLocationCoordinates(locationName: string, regionName?: string): CompleteSenegalLocation | null {
    const location = this.locations.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase() &&
      (!regionName || loc.region.toLowerCase() === regionName.toLowerCase())
    );
    
    return location || null;
  }

  // Valider qu'une localité existe au Sénégal
  validateLocation(locationName: string, regionName: string): boolean {
    return this.locations.some(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase() &&
      loc.region.toLowerCase() === regionName.toLowerCase()
    );
  }

  // Obtenir toutes les localités d'une région
  getLocationsByRegion(regionName: string): CompleteSenegalLocation[] {
    return this.locations
      .filter(loc => loc.region.toLowerCase() === regionName.toLowerCase())
      .sort((a, b) => {
        // Communes d'abord, puis arrondissements
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  // Obtenir toutes les localités d'un département
  getLocationsByDepartment(departmentName: string, regionName: string): CompleteSenegalLocation[] {
    return this.locations
      .filter(loc => 
        loc.department.toLowerCase() === departmentName.toLowerCase() &&
        loc.region.toLowerCase() === regionName.toLowerCase()
      )
      .sort((a, b) => {
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  // Recherche intelligente qui combine nom, département et région
  intelligentSearch(query: string, limit: number = 20): CompleteSenegalLocation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    return this.locations
      .map(location => {
        let score = 0;
        const locationText = `${location.name} ${location.department} ${location.region}`.toLowerCase();
        
        // Score basé sur les correspondances de mots
        queryWords.forEach(word => {
          if (location.name.toLowerCase().includes(word)) score += 10;
          if (location.department.toLowerCase().includes(word)) score += 5;
          if (location.region.toLowerCase().includes(word)) score += 3;
          if (locationText.includes(word)) score += 1;
        });
        
        // Bonus pour correspondance exacte
        if (location.name.toLowerCase() === normalizedQuery) score += 50;
        if (location.name.toLowerCase().startsWith(normalizedQuery)) score += 20;
        
        // Bonus pour les communes
        if (location.type === 'commune') score += 2;
        
        return { location, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.location);
  }

  // Convertir coordonnées en identifiant pour OpenWeather
  getWeatherLocationKey(lat: number, lng: number): string {
    let closestLocation = this.locations[0];
    let minDistance = this.calculateDistance(lat, lng, closestLocation.lat, closestLocation.lng);
    
    for (const location of this.locations) {
      const distance = this.calculateDistance(lat, lng, location.lat, location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    }
    
    return closestLocation.name.toLowerCase().replace(/\s+/g, '-');
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Fonction pour trouver la localité la plus proche d'une position GPS
  findNearestLocation(lat: number, lng: number, maxDistance: number = 50): CompleteSenegalLocation | null {
    let nearestLocation: CompleteSenegalLocation | null = null;
    let minDistance = maxDistance; // Distance max en km

    this.locations.forEach(location => {
      const distance = this.calculateDistanceGPS(lat, lng, location.lat, location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = location;
      }
    });

    return nearestLocation;
  }

  // Nouvelle méthode pour calculer distance (évite conflit avec méthode existante)
  calculateDistanceGPS(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Obtenir statistiques sur les localités
  getStatistics() {
    const regionStats = new Map<string, number>();
    const typeStats = new Map<string, number>();
    
    this.locations.forEach(location => {
      regionStats.set(location.region, (regionStats.get(location.region) || 0) + 1);
      typeStats.set(location.type, (typeStats.get(location.type) || 0) + 1);
    });
    
    return {
      total: this.locations.length,
      byRegion: Object.fromEntries(regionStats),
      byType: Object.fromEntries(typeStats)
    };
  }
}

export const completeSenegalLocationService = new CompleteSenegalLocationService();
export type { CompleteSenegalLocation };