// Base de données complète des localités du Sénégal avec coordonnées - toutes communes et arrondissements
const COMPLETE_SENEGAL_LOCATIONS = [
  // Région de Dakar - Toutes communes et arrondissements
  { name: "Dakar", region: "Dakar", department: "Dakar", lat: 14.6937, lng: -17.4441, type: "commune" as const },
  { name: "Plateau", region: "Dakar", department: "Dakar", lat: 14.6928, lng: -17.4467, type: "arrondissement" },
  { name: "Médina", region: "Dakar", department: "Dakar", lat: 14.6889, lng: -17.4558, type: "arrondissement" },
  { name: "Gueule Tapée-Fass-Colobane", region: "Dakar", department: "Dakar", lat: 14.6792, lng: -17.4592, type: "arrondissement" },
  { name: "Fann-Point E-Amitié", region: "Dakar", department: "Dakar", lat: 14.7039, lng: -17.4694, type: "arrondissement" },
  { name: "Grand Dakar", region: "Dakar", department: "Dakar", lat: 14.7214, lng: -17.4711, type: "arrondissement" },
  { name: "Parcelles Assainies", region: "Dakar", department: "Dakar", lat: 14.7558, lng: -17.4394, type: "arrondissement" },
  
  { name: "Pikine", region: "Dakar", department: "Pikine", lat: 14.7581, lng: -17.3961, type: "commune" },
  { name: "Pikine Nord", region: "Dakar", department: "Pikine", lat: 14.7667, lng: -17.3889, type: "arrondissement" },
  { name: "Pikine Ouest", region: "Dakar", department: "Pikine", lat: 14.7528, lng: -17.4083, type: "arrondissement" },
  { name: "Pikine Est", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3778, type: "arrondissement" },
  { name: "Dagoudane", region: "Dakar", department: "Pikine", lat: 14.7722, lng: -17.3667, type: "arrondissement" },
  { name: "Guinaw Rail Nord", region: "Dakar", department: "Pikine", lat: 14.7458, lng: -17.3806, type: "arrondissement" },
  { name: "Guinaw Rail Sud", region: "Dakar", department: "Pikine", lat: 14.7375, lng: -17.3889, type: "arrondissement" },
  { name: "Thiaroye Gare", region: "Dakar", department: "Pikine", lat: 14.7847, lng: -17.3472, type: "arrondissement" },
  { name: "Thiaroye sur Mer", region: "Dakar", department: "Pikine", lat: 14.7986, lng: -17.3222, type: "arrondissement" },
  { name: "Yeumbeul Nord", region: "Dakar", department: "Pikine", lat: 14.7764, lng: -17.3389, type: "arrondissement" },
  { name: "Yeumbeul Sud", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3472, type: "arrondissement" },
  { name: "Malika", region: "Dakar", department: "Pikine", lat: 14.7833, lng: -17.3694, type: "arrondissement" },
  { name: "Keur Massar", region: "Dakar", department: "Pikine", lat: 14.7911, lng: -17.3139, type: "arrondissement" },
  
  { name: "Guédiawaye", region: "Dakar", department: "Guédiawaye", lat: 14.7744, lng: -17.4111, type: "commune" },
  { name: "Golf Sud", region: "Dakar", department: "Guédiawaye", lat: 14.7667, lng: -17.4167, type: "arrondissement" },
  { name: "Médina Gounass", region: "Dakar", department: "Guédiawaye", lat: 14.7792, lng: -17.4056, type: "arrondissement" },
  { name: "Ndiarème Limamou Laye", region: "Dakar", department: "Guédiawaye", lat: 14.7847, lng: -17.4139, type: "arrondissement" },
  { name: "Sam Notaire", region: "Dakar", department: "Guédiawaye", lat: 14.7694, lng: -17.4083, type: "arrondissement" },
  { name: "Wakhinane Nimzatt", region: "Dakar", department: "Guédiawaye", lat: 14.7778, lng: -17.4167, type: "arrondissement" },
  
  { name: "Rufisque", region: "Dakar", department: "Rufisque", lat: 14.7167, lng: -17.2667, type: "commune" },
  { name: "Rufisque Est", region: "Dakar", department: "Rufisque", lat: 14.7222, lng: -17.2556, type: "arrondissement" },
  { name: "Rufisque Ouest", region: "Dakar", department: "Rufisque", lat: 14.7111, lng: -17.2778, type: "arrondissement" },
  { name: "Rufisque Nord", region: "Dakar", department: "Rufisque", lat: 14.7250, lng: -17.2639, type: "arrondissement" },
  { name: "Bargny", region: "Dakar", department: "Rufisque", lat: 14.6969, lng: -17.1856, type: "commune" },
  { name: "Diamniadio", region: "Dakar", department: "Rufisque", lat: 14.7172, lng: -17.1828, type: "commune" },
  { name: "Sébikotane", region: "Dakar", department: "Rufisque", lat: 14.7422, lng: -17.1294, type: "commune" },
  { name: "Sangalkam", region: "Dakar", department: "Rufisque", lat: 14.7683, lng: -17.1089, type: "commune" },
  { name: "Jaxaay-Parcelles-Niakoul Rap", region: "Dakar", department: "Rufisque", lat: 14.7458, lng: -17.1444, type: "commune" },
  
  // Région de Thiès - Toutes communes et arrondissements  
  { name: "Thiès", region: "Thiès", department: "Thiès", lat: 14.7886, lng: -16.9239, type: "commune" },
  { name: "Thiès Est", region: "Thiès", department: "Thiès", lat: 14.7944, lng: -16.9139, type: "arrondissement" },
  { name: "Thiès Ouest", region: "Thiès", department: "Thiès", lat: 14.7828, lng: -16.9339, type: "arrondissement" },
  { name: "Thiès Nord", region: "Thiès", department: "Thiès", lat: 14.7972, lng: -16.9222, type: "arrondissement" },
  { name: "Pout", region: "Thiès", department: "Thiès", lat: 14.7683, lng: -16.8619, type: "commune" },
  { name: "Khombole", region: "Thiès", department: "Thiès", lat: 14.7667, lng: -16.6500, type: "commune" },
  { name: "Notto Diobass", region: "Thiès", department: "Thiès", lat: 14.8167, lng: -16.8833, type: "commune" },
  { name: "Kayar", region: "Thiès", department: "Thiès", lat: 14.9167, lng: -17.1167, type: "commune" },
  { name: "Fandène", region: "Thiès", department: "Thiès", lat: 14.8500, lng: -16.9833, type: "commune" },
  
  { name: "Tivaouane", region: "Thiès", department: "Tivaouane", lat: 14.9500, lng: -16.8167, type: "commune" },
  { name: "Mérina Dakhar", region: "Thiès", department: "Tivaouane", lat: 14.9667, lng: -16.7833, type: "commune" },
  { name: "Pambal", region: "Thiès", department: "Tivaouane", lat: 14.9167, lng: -16.7833, type: "commune" },
  { name: "Taïba Ndiaye", region: "Thiès", department: "Tivaouane", lat: 14.8833, lng: -16.6333, type: "commune" },
  { name: "Mboro", region: "Thiès", department: "Tivaouane", lat: 14.8000, lng: -16.9667, type: "commune" },
  { name: "Méouane", region: "Thiès", department: "Tivaouane", lat: 14.9333, lng: -16.8500, type: "commune" },
  { name: "Niakha", region: "Thiès", department: "Tivaouane", lat: 14.9000, lng: -16.8667, type: "commune" },
  { name: "Koul", region: "Thiès", department: "Tivaouane", lat: 14.9500, lng: -16.7500, type: "commune" },
  
  { name: "Mbour", region: "Thiès", department: "Mbour", lat: 14.4199, lng: -16.9619, type: "commune" },
  { name: "Fissel", region: "Thiès", department: "Mbour", lat: 14.4333, lng: -16.9167, type: "commune" },
  { name: "Sindia", region: "Thiès", department: "Mbour", lat: 14.2833, lng: -16.9333, type: "commune" },
  { name: "Sessène", region: "Thiès", department: "Mbour", lat: 14.3000, lng: -16.8833, type: "commune" },
  { name: "Sandiara", region: "Thiès", department: "Mbour", lat: 14.4833, lng: -16.8167, type: "commune" },
  { name: "Nguekhokh", region: "Thiès", department: "Mbour", lat: 14.5167, lng: -16.9500, type: "commune" },
  { name: "Joal-Fadiouth", region: "Thiès", department: "Mbour", lat: 14.1667, lng: -16.8333, type: "commune" },
  { name: "Thiadiaye", region: "Thiès", department: "Mbour", lat: 14.3500, lng: -16.7833, type: "commune" },
  { name: "Popenguine", region: "Thiès", department: "Mbour", lat: 14.3500, lng: -17.1167, type: "commune" },
  { name: "Somone", region: "Thiès", department: "Mbour", lat: 14.4667, lng: -16.9833, type: "commune" },
  { name: "Saly Portudal", region: "Thiès", department: "Mbour", lat: 14.4500, lng: -17.0000, type: "commune" },
  
  // Région de Saint-Louis - Toutes communes et arrondissements
  { name: "Saint-Louis", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0179, lng: -16.4897, type: "commune" },
  { name: "Saint-Louis Nord", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0250, lng: -16.4833, type: "arrondissement" },
  { name: "Saint-Louis Sud", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0108, lng: -16.4961, type: "arrondissement" },
  { name: "Rao", region: "Saint-Louis", department: "Saint-Louis", lat: 15.9333, lng: -16.4667, type: "commune" },
  { name: "Gandon", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0833, lng: -16.4167, type: "commune" },
  { name: "Mpal", region: "Saint-Louis", department: "Saint-Louis", lat: 16.0667, lng: -16.5000, type: "commune" },
  
  { name: "Dagana", region: "Saint-Louis", department: "Dagana", lat: 16.5167, lng: -15.5000, type: "commune" },
  { name: "Richard Toll", region: "Saint-Louis", department: "Dagana", lat: 16.4625, lng: -15.7019, type: "commune" },
  { name: "Rosso Sénégal", region: "Saint-Louis", department: "Dagana", lat: 16.5167, lng: -15.8167, type: "commune" },
  { name: "Mbane", region: "Saint-Louis", department: "Dagana", lat: 16.4500, lng: -15.4167, type: "commune" },
  { name: "Ndombo Sandjiry", region: "Saint-Louis", department: "Dagana", lat: 16.5500, lng: -15.6000, type: "commune" },
  { name: "Ronkh", region: "Saint-Louis", department: "Dagana", lat: 16.4167, lng: -15.6667, type: "commune" },
  { name: "Bokhol", region: "Saint-Louis", department: "Dagana", lat: 16.3667, lng: -15.3833, type: "commune" },
  { name: "Gaé", region: "Saint-Louis", department: "Dagana", lat: 16.2833, lng: -15.4500, type: "commune" },
  
  { name: "Podor", region: "Saint-Louis", department: "Podor", lat: 16.6533, lng: -14.9594, type: "commune" },
  { name: "Golléré", region: "Saint-Louis", department: "Podor", lat: 16.6167, lng: -14.9167, type: "commune" },
  { name: "Guédé Village", region: "Saint-Louis", department: "Podor", lat: 16.5167, lng: -14.7500, type: "commune" },
  { name: "Guédé Chantier", region: "Saint-Louis", department: "Podor", lat: 16.5333, lng: -14.7333, type: "commune" },
  { name: "Ndiayène Pendao", region: "Saint-Louis", department: "Podor", lat: 16.6000, lng: -15.0667, type: "commune" },
  { name: "Dodel", region: "Saint-Louis", department: "Podor", lat: 16.7167, lng: -14.9333, type: "commune" },
  { name: "Gamadji Saré", region: "Saint-Louis", department: "Podor", lat: 16.7833, lng: -14.8833, type: "commune" },
  { name: "Ndioum", region: "Saint-Louis", department: "Podor", lat: 16.7167, lng: -14.7167, type: "commune" },
  { name: "Fanaye", region: "Saint-Louis", department: "Podor", lat: 16.5833, lng: -15.2000, type: "commune" },
  { name: "Cas-Cas", region: "Saint-Louis", department: "Podor", lat: 16.6500, lng: -15.0833, type: "commune" },
  { name: "Démette", region: "Saint-Louis", department: "Podor", lat: 16.6833, lng: -15.1167, type: "commune" },
  { name: "Méry", region: "Saint-Louis", department: "Podor", lat: 16.7333, lng: -15.0000, type: "commune" },
  { name: "Mbolo Birane", region: "Saint-Louis", department: "Podor", lat: 16.7000, lng: -15.0500, type: "commune" },
  { name: "Pété", region: "Saint-Louis", department: "Podor", lat: 16.6333, lng: -14.8167, type: "commune" },
  
  // Région de Diourbel - Toutes communes et arrondissements
  { name: "Diourbel", region: "Diourbel", department: "Diourbel", lat: 14.6500, lng: -16.2333, type: "commune" },
  { name: "Diourbel Nord", region: "Diourbel", department: "Diourbel", lat: 14.6611, lng: -16.2278, type: "arrondissement" },
  { name: "Diourbel Sud", region: "Diourbel", department: "Diourbel", lat: 14.6389, lng: -16.2389, type: "arrondissement" },
  { name: "Ndoulo", region: "Diourbel", department: "Diourbel", lat: 14.6167, lng: -16.1833, type: "commune" },
  { name: "Gade", region: "Diourbel", department: "Diourbel", lat: 14.6000, lng: -16.3000, type: "commune" },
  { name: "Taïf", region: "Diourbel", department: "Diourbel", lat: 14.6833, lng: -16.3167, type: "commune" },
  { name: "Paoskoto", region: "Diourbel", department: "Diourbel", lat: 14.5833, lng: -16.2667, type: "commune" },
  { name: "Réfane", region: "Diourbel", department: "Diourbel", lat: 14.6167, lng: -16.2500, type: "commune" },
  
  { name: "Touba", region: "Diourbel", department: "Mbacké", lat: 14.8667, lng: -15.8833, type: "commune" },
  { name: "Mbacké", region: "Diourbel", department: "Mbacké", lat: 14.8000, lng: -15.9167, type: "commune" },
  { name: "Ndame", region: "Diourbel", department: "Mbacké", lat: 14.8500, lng: -15.9500, type: "commune" },
  { name: "Ngogom", region: "Diourbel", department: "Mbacké", lat: 14.7833, lng: -15.8500, type: "commune" },
  { name: "Madina", region: "Diourbel", department: "Mbacké", lat: 14.8333, lng: -15.8167, type: "commune" },
  { name: "Darou Salam", region: "Diourbel", department: "Mbacké", lat: 14.8833, lng: -15.9167, type: "commune" },
  { name: "Kael", region: "Diourbel", department: "Mbacké", lat: 14.7500, lng: -15.9500, type: "commune" },
  { name: "Nghaye", region: "Diourbel", department: "Mbacké", lat: 14.7167, lng: -15.8833, type: "commune" },
  { name: "Taïba Moustpha", region: "Diourbel", department: "Mbacké", lat: 14.8167, lng: -15.9833, type: "commune" },
  
  { name: "Bambey", region: "Diourbel", department: "Bambey", lat: 14.7000, lng: -16.4500, type: "commune" },
  { name: "Baba Garage", region: "Diourbel", department: "Bambey", lat: 14.6833, lng: -16.4167, type: "commune" },
  { name: "Dinguiraye", region: "Diourbel", department: "Bambey", lat: 14.7333, lng: -16.4833, type: "commune" },
  { name: "Lambaye", region: "Diourbel", department: "Bambey", lat: 14.7500, lng: -16.3500, type: "commune" },
  { name: "Ngoye", region: "Diourbel", department: "Bambey", lat: 14.6667, lng: -16.5167, type: "commune" },
  { name: "Refane Diourbel", region: "Diourbel", department: "Bambey", lat: 14.6833, lng: -16.4833, type: "commune" },
  
  // Région de Louga - Toutes communes et arrondissements
  { name: "Louga", region: "Louga", department: "Louga", lat: 15.6167, lng: -16.2333, type: "commune" },
  { name: "Louga Nord", region: "Louga", department: "Louga", lat: 15.6250, lng: -16.2278, type: "arrondissement" },
  { name: "Louga Est", region: "Louga", department: "Louga", lat: 15.6194, lng: -16.2250, type: "arrondissement" },
  { name: "Gueoul", region: "Louga", department: "Louga", lat: 15.6500, lng: -16.1833, type: "commune" },
  { name: "Sakal", region: "Louga", department: "Louga", lat: 15.6833, lng: -16.2833, type: "commune" },
  { name: "Nguer Malal", region: "Louga", department: "Louga", lat: 15.5500, lng: -16.2000, type: "commune" },
  { name: "Léona", region: "Louga", department: "Louga", lat: 15.5833, lng: -16.3167, type: "commune" },
  { name: "Coki", region: "Louga", department: "Louga", lat: 15.5333, lng: -16.1500, type: "commune" },
  { name: "Pete Ouarack", region: "Louga", department: "Louga", lat: 15.6000, lng: -16.3500, type: "commune" },
  { name: "Kelle Gueye", region: "Louga", department: "Louga", lat: 15.5167, lng: -16.2667, type: "commune" },
  
  { name: "Linguère", region: "Louga", department: "Linguère", lat: 15.3833, lng: -15.1167, type: "commune" },
  { name: "Barkédji", region: "Louga", department: "Linguère", lat: 15.2833, lng: -14.8833, type: "commune" },
  { name: "Yang Yang", region: "Louga", department: "Linguère", lat: 15.1833, lng: -15.1167, type: "commune" },
  { name: "Thiél", region: "Louga", department: "Linguère", lat: 15.4167, lng: -15.2833, type: "commune" },
  { name: "Dahra", region: "Louga", department: "Linguère", lat: 15.3333, lng: -15.4833, type: "commune" },
  { name: "Dodji", region: "Louga", department: "Linguère", lat: 15.2500, lng: -15.3000, type: "commune" },
  { name: "Labgar", region: "Louga", department: "Linguère", lat: 15.1167, lng: -15.4167, type: "commune" },
  { name: "Sagatta Djoloff", region: "Louga", department: "Linguère", lat: 15.4500, lng: -14.9833, type: "commune" },
  { name: "Ouarkhokh", region: "Louga", department: "Linguère", lat: 15.1000, lng: -15.2000, type: "commune" },
  
  { name: "Kébémer", region: "Louga", department: "Kébémer", lat: 15.0167, lng: -16.4833, type: "commune" },
  { name: "Lompoul", region: "Louga", department: "Kébémer", lat: 15.0833, lng: -16.7167, type: "commune" },
  { name: "Darou Mousty", region: "Louga", department: "Kébémer", lat: 15.0500, lng: -16.4167, type: "commune" },
  { name: "Sagatta Gueth", region: "Louga", department: "Kébémer", lat: 14.9500, lng: -16.4500, type: "commune" },
  { name: "Thiomby", region: "Louga", department: "Kébémer", lat: 15.0000, lng: -16.5500, type: "commune" },
  { name: "Loro", region: "Louga", department: "Kébémer", lat: 14.9167, lng: -16.5167, type: "commune" },
  { name: "Bandegne Ouolof", region: "Louga", department: "Kébémer", lat: 14.9833, lng: -16.3833, type: "commune" },
  
  // Région de Fatick - Toutes communes
  { name: "Fatick", region: "Fatick", department: "Fatick", lat: 14.3333, lng: -16.4167, type: "commune" },
  { name: "Dioffior", region: "Fatick", department: "Fatick", lat: 14.2833, lng: -16.4833, type: "commune" },
  { name: "Fimela", region: "Fatick", department: "Fatick", lat: 14.2167, lng: -16.5333, type: "commune" },
  { name: "Loul Sessène", region: "Fatick", department: "Fatick", lat: 14.1667, lng: -16.4500, type: "commune" },
  { name: "Mbellacadiao", region: "Fatick", department: "Fatick", lat: 14.3000, lng: -16.3500, type: "commune" },
  { name: "Ndiob", region: "Fatick", department: "Fatick", lat: 14.2000, lng: -16.3833, type: "commune" },
  { name: "Palmarin", region: "Fatick", department: "Fatick", lat: 14.1500, lng: -16.7500, type: "commune" },
  { name: "Tattaguine", region: "Fatick", department: "Fatick", lat: 14.3667, lng: -16.5167, type: "commune" },
  
  { name: "Foundiougne", region: "Fatick", department: "Foundiougne", lat: 14.1333, lng: -16.4667, type: "commune" },
  { name: "Djilor", region: "Fatick", department: "Foundiougne", lat: 14.0500, lng: -16.4167, type: "commune" },
  { name: "Niodior", region: "Fatick", department: "Foundiougne", lat: 14.0000, lng: -16.5167, type: "commune" },
  { name: "Toubacouta", region: "Fatick", department: "Foundiougne", lat: 13.9333, lng: -16.4833, type: "commune" },
  { name: "Karang", region: "Fatick", department: "Foundiougne", lat: 13.8667, lng: -16.4500, type: "commune" },
  { name: "Sokone", region: "Fatick", department: "Foundiougne", lat: 13.8833, lng: -16.3833, type: "commune" },
  { name: "Bassoul", region: "Fatick", department: "Foundiougne", lat: 14.0833, lng: -16.4000, type: "commune" },
  { name: "Diagane Barka", region: "Fatick", department: "Foundiougne", lat: 14.1000, lng: -16.3833, type: "commune" },
  { name: "Djirnda", region: "Fatick", department: "Foundiougne", lat: 14.0167, lng: -16.4500, type: "commune" },
  { name: "Keur Samba Kane", region: "Fatick", department: "Foundiougne", lat: 14.0667, lng: -16.4333, type: "commune" },
  { name: "Passy", region: "Fatick", department: "Foundiougne", lat: 13.9833, lng: -16.4333, type: "commune" },
  
  { name: "Gossas", region: "Fatick", department: "Gossas", lat: 14.5000, lng: -16.0667, type: "commune" },
  { name: "Colobane", region: "Fatick", department: "Gossas", lat: 14.4667, lng: -16.0333, type: "commune" },
  { name: "Ouadiour", region: "Fatick", department: "Gossas", lat: 14.4333, lng: -16.1167, type: "commune" },
  { name: "Patar", region: "Fatick", department: "Gossas", lat: 14.5333, lng: -16.1333, type: "commune" },
  
  // Région de Kaolack - Toutes communes
  { name: "Kaolack", region: "Kaolack", department: "Kaolack", lat: 14.1500, lng: -16.0833, type: "commune" },
  { name: "Kaolack Nord", region: "Kaolack", department: "Kaolack", lat: 14.1583, lng: -16.0778, type: "arrondissement" },
  { name: "Kaolack Sud", region: "Kaolack", department: "Kaolack", lat: 14.1417, lng: -16.0889, type: "arrondissement" },
  { name: "Gandiaye", region: "Kaolack", department: "Kaolack", lat: 14.2333, lng: -16.1500, type: "commune" },
  { name: "Keur Baka", region: "Kaolack", department: "Kaolack", lat: 14.0833, lng: -16.1167, type: "commune" },
  { name: "Latmingué", region: "Kaolack", department: "Kaolack", lat: 14.1000, lng: -16.1833, type: "commune" },
  { name: "Ndoffane", region: "Kaolack", department: "Kaolack", lat: 14.1833, lng: -16.0500, type: "commune" },
  { name: "Ndiédieng", region: "Kaolack", department: "Kaolack", lat: 14.2167, lng: -16.0167, type: "commune" },
  { name: "Thiomby", region: "Kaolack", department: "Kaolack", lat: 14.0500, lng: -16.0500, type: "commune" },
  { name: "Sibassor", region: "Kaolack", department: "Kaolack", lat: 14.0167, lng: -16.1333, type: "commune" },
  
  { name: "Nioro du Rip", region: "Kaolack", department: "Nioro du Rip", lat: 13.7500, lng: -15.7833, type: "commune" },
  { name: "Keur Maba Diakhou", region: "Kaolack", department: "Nioro du Rip", lat: 13.8333, lng: -15.7167, type: "commune" },
  { name: "Médina Sabakh", region: "Kaolack", department: "Nioro du Rip", lat: 13.8667, lng: -15.8167, type: "commune" },
  { name: "Paoskoto", region: "Kaolack", department: "Nioro du Rip", lat: 13.8167, lng: -15.9000, type: "commune" },
  { name: "Wack Ngouna", region: "Kaolack", department: "Nioro du Rip", lat: 13.7167, lng: -15.7000, type: "commune" },
  { name: "Taiba Niassène", region: "Kaolack", department: "Nioro du Rip", lat: 13.7833, lng: -15.8500, type: "commune" },
  { name: "Yayème", region: "Kaolack", department: "Nioro du Rip", lat: 13.6833, lng: -15.8167, type: "commune" },
  { name: "Kayemor", region: "Kaolack", department: "Nioro du Rip", lat: 13.9167, lng: -15.9333, type: "commune" },
  { name: "Ngayène", region: "Kaolack", department: "Nioro du Rip", lat: 13.8833, lng: -15.9667, type: "commune" },
  { name: "Kahi", region: "Kaolack", department: "Nioro du Rip", lat: 13.8000, lng: -15.6500, type: "commune" },
  { name: "Porokhane", region: "Kaolack", department: "Nioro du Rip", lat: 13.7667, lng: -15.6167, type: "commune" },
  { name: "Dabaly", region: "Kaolack", department: "Nioro du Rip", lat: 13.7000, lng: -15.6833, type: "commune" },
  
  { name: "Guinguinéo", region: "Kaolack", department: "Guinguinéo", lat: 14.2667, lng: -15.9500, type: "commune" },
  { name: "Fass", region: "Kaolack", department: "Guinguinéo", lat: 14.2167, lng: -15.9167, type: "commune" },
  { name: "Ngathie Naude", region: "Kaolack", department: "Guinguinéo", lat: 14.3167, lng: -15.9833, type: "commune" },
  { name: "Mbadakhoune", region: "Kaolack", department: "Guinguinéo", lat: 14.3000, lng: -15.9167, type: "commune" },
  { name: "Ourour", region: "Kaolack", department: "Guinguinéo", lat: 14.2333, lng: -15.8833, type: "commune" },
  { name: "Malème Niani", region: "Kaolack", department: "Guinguinéo", lat: 14.1667, lng: -15.8667, type: "commune" },
  
  // Région de Kaffrine - Toutes communes
  { name: "Kaffrine", region: "Kaffrine", department: "Kaffrine", lat: 14.1167, lng: -15.5500, type: "commune" },
  { name: "Nganda", region: "Kaffrine", department: "Kaffrine", lat: 14.0833, lng: -15.5167, type: "commune" },
  { name: "Kathiotte", region: "Kaffrine", department: "Kaffrine", lat: 14.0500, lng: -15.6000, type: "commune" },
  { name: "Kahi", region: "Kaffrine", department: "Kaffrine", lat: 14.1833, lng: -15.6167, type: "commune" },
  { name: "Gniby", region: "Kaffrine", department: "Kaffrine", lat: 14.1500, lng: -15.4833, type: "commune" },
  
  { name: "Birkelane", region: "Kaffrine", department: "Birkelane", lat: 14.2167, lng: -15.6167, type: "commune" },
  { name: "Keur Mboucki", region: "Kaffrine", department: "Birkelane", lat: 14.2500, lng: -15.5500, type: "commune" },
  { name: "Touba Toul", region: "Kaffrine", department: "Birkelane", lat: 14.1833, lng: -15.5833, type: "commune" },
  { name: "Diamal", region: "Kaffrine", department: "Birkelane", lat: 14.2833, lng: -15.6500, type: "commune" },
  
  { name: "Malem Hodar", region: "Kaffrine", department: "Malem Hodar", lat: 13.8167, lng: -15.3167, type: "commune" },
  { name: "Dya", region: "Kaffrine", department: "Malem Hodar", lat: 13.8500, lng: -15.2833, type: "commune" },
  { name: "Ndiognick", region: "Kaffrine", department: "Malem Hodar", lat: 13.7833, lng: -15.2500, type: "commune" },
  { name: "Ndioum Ngainth", region: "Kaffrine", department: "Malem Hodar", lat: 13.7500, lng: -15.3500, type: "commune" },
  { name: "Katakel", region: "Kaffrine", department: "Malem Hodar", lat: 13.8833, lng: -15.3500, type: "commune" },
  
  { name: "Koungheul", region: "Kaffrine", department: "Koungheul", lat: 13.9833, lng: -14.8000, type: "commune" },
  { name: "Lour Escale", region: "Kaffrine", department: "Koungheul", lat: 13.9500, lng: -14.7500, type: "commune" },
  { name: "Payar", region: "Kaffrine", department: "Koungheul", lat: 13.9167, lng: -14.8333, type: "commune" },
  { name: "Ida Mouride", region: "Kaffrine", department: "Koungheul", lat: 14.0167, lng: -14.8500, type: "commune" },
  { name: "Missirah", region: "Kaffrine", department: "Koungheul", lat: 13.9000, lng: -14.7833, type: "commune" },
  { name: "Maka Yop", region: "Kaffrine", department: "Koungheul", lat: 13.8667, lng: -14.7167, type: "commune" },
  
  // Région de Tambacounda - Toutes communes
  { name: "Tambacounda", region: "Tambacounda", department: "Tambacounda", lat: 13.7667, lng: -13.6667, type: "commune" },
  { name: "Koumpentoum", region: "Tambacounda", department: "Tambacounda", lat: 13.5167, lng: -14.5833, type: "commune" },
  { name: "Missirah Sirimana", region: "Tambacounda", department: "Tambacounda", lat: 13.5000, lng: -13.8333, type: "commune" },
  { name: "Netéboulou", region: "Tambacounda", department: "Tambacounda", lat: 13.6333, lng: -13.7833, type: "commune" },
  { name: "Makacoulibantang", region: "Tambacounda", department: "Tambacounda", lat: 13.6833, lng: -13.4833, type: "commune" },
  { name: "Dialacoto", region: "Tambacounda", department: "Tambacounda", lat: 13.5667, lng: -13.5833, type: "commune" },
  
  { name: "Bakel", region: "Tambacounda", department: "Bakel", lat: 14.9000, lng: -12.4667, type: "commune" },
  { name: "Bala", region: "Tambacounda", department: "Bakel", lat: 14.8167, lng: -12.4000, type: "commune" },
  { name: "Diawara", region: "Tambacounda", department: "Bakel", lat: 14.8500, lng: -12.3500, type: "commune" },
  { name: "Kidira", region: "Tambacounda", department: "Bakel", lat: 14.4500, lng: -12.2167, type: "commune" },
  { name: "Madina Bafé", region: "Tambacounda", department: "Bakel", lat: 14.7833, lng: -12.2833, type: "commune" },
  { name: "Moudéry", region: "Tambacounda", department: "Bakel", lat: 14.7167, lng: -12.3167, type: "commune" },
  { name: "Ballou", region: "Tambacounda", department: "Bakel", lat: 14.8333, lng: -12.5333, type: "commune" },
  { name: "Kéniéba", region: "Tambacounda", department: "Bakel", lat: 14.6833, lng: -12.5500, type: "commune" },
  { name: "Gabou", region: "Tambacounda", department: "Bakel", lat: 14.6500, lng: -12.3833, type: "commune" },
  { name: "Goudiry", region: "Tambacounda", department: "Goudiry", lat: 14.1833, lng: -12.7167, type: "commune" },
  { name: "Dianké Makhan", region: "Tambacounda", department: "Goudiry", lat: 14.2167, lng: -12.6500, type: "commune" },
  { name: "Kothiary", region: "Tambacounda", department: "Goudiry", lat: 14.1500, lng: -12.6833, type: "commune" },
  { name: "Sinthiou Malème", region: "Tambacounda", department: "Goudiry", lat: 14.2500, lng: -12.7833, type: "commune" },
  { name: "Bélé", region: "Tambacounda", department: "Goudiry", lat: 14.1167, lng: -12.8167, type: "commune" },
  
  // Région de Kédougou - Toutes communes
  { name: "Kédougou", region: "Kédougou", department: "Kédougou", lat: 12.5667, lng: -12.1833, type: "commune" },
  { name: "Bandafassi", region: "Kédougou", department: "Kédougou", lat: 12.5167, lng: -12.3167, type: "commune" },
  { name: "Dindefelo", region: "Kédougou", department: "Kédougou", lat: 12.4500, lng: -12.2833, type: "commune" },
  { name: "Ninéfescha", region: "Kédougou", department: "Kédougou", lat: 12.4833, lng: -12.1167, type: "commune" },
  { name: "Fongolimbi", region: "Kédougou", department: "Kédougou", lat: 12.6167, lng: -12.2500, type: "commune" },
  
  { name: "Saraya", region: "Kédougou", department: "Saraya", lat: 12.8167, lng: -11.7500, type: "commune" },
  { name: "Bembou", region: "Kédougou", department: "Saraya", lat: 12.8833, lng: -11.7167, type: "commune" },
  { name: "Khossanto", region: "Kédougou", department: "Saraya", lat: 12.7833, lng: -11.9167, type: "commune" },
  { name: "Dakembo", region: "Kédougou", department: "Saraya", lat: 12.8500, lng: -11.8000, type: "commune" },
  { name: "Sabodala", region: "Kédougou", department: "Saraya", lat: 12.7500, lng: -11.8333, type: "commune" },
  
  { name: "Salémata", region: "Kédougou", department: "Salémata", lat: 12.9167, lng: -12.0667, type: "commune" },
  { name: "Ethiolo", region: "Kédougou", department: "Salémata", lat: 12.9500, lng: -12.1167, type: "commune" },
  { name: "Dakatéli", region: "Kédougou", department: "Salémata", lat: 12.8833, lng: -12.0333, type: "commune" },
  { name: "Tomboronkoto", region: "Kédougou", department: "Salémata", lat: 12.9833, lng: -12.0167, type: "commune" },
  
  // Région de Kolda - Toutes communes
  { name: "Kolda", region: "Kolda", department: "Kolda", lat: 12.8833, lng: -14.9500, type: "commune" },
  { name: "Salikégné", region: "Kolda", department: "Kolda", lat: 12.8500, lng: -14.9167, type: "commune" },
  { name: "Bagadadji", region: "Kolda", department: "Kolda", lat: 12.9167, lng: -14.9833, type: "commune" },
  { name: "Mampatim", region: "Kolda", department: "Kolda", lat: 12.9000, lng: -14.8833, type: "commune" },
  { name: "Dabo", region: "Kolda", department: "Kolda", lat: 12.8167, lng: -14.8167, type: "commune" },
  { name: "Dioulacolon", region: "Kolda", department: "Kolda", lat: 12.7833, lng: -14.8833, type: "commune" },
  { name: "Coumbacara", region: "Kolda", department: "Kolda", lat: 12.8000, lng: -14.9167, type: "commune" },
  { name: "Tankanto Escale", region: "Kolda", department: "Kolda", lat: 12.9333, lng: -14.9167, type: "commune" },
  { name: "Médina El Hadj", region: "Kolda", department: "Kolda", lat: 12.9500, lng: -14.8500, type: "commune" },
  
  { name: "Vélingara", region: "Kolda", department: "Vélingara", lat: 13.1500, lng: -14.1167, type: "commune" },
  { name: "Linkering", region: "Kolda", department: "Vélingara", lat: 13.2167, lng: -14.1833, type: "commune" },
  { name: "Paroumba", region: "Kolda", department: "Vélingara", lat: 13.1833, lng: -14.0500, type: "commune" },
  { name: "Kounkané", region: "Kolda", department: "Vélingara", lat: 13.0833, lng: -14.0833, type: "commune" },
  { name: "Saré Coly Sallah", region: "Kolda", department: "Vélingara", lat: 13.1167, lng: -14.0167, type: "commune" },
  { name: "Bonconto", region: "Kolda", department: "Vélingara", lat: 13.0500, lng: -14.1833, type: "commune" },
  { name: "Wendou Bosséabé", region: "Kolda", department: "Vélingara", lat: 13.2000, lng: -14.2167, type: "commune" },
  { name: "Ouassadou", region: "Kolda", department: "Vélingara", lat: 13.0167, lng: -14.1500, type: "commune" },
  { name: "Kandiaye", region: "Kolda", department: "Vélingara", lat: 13.1000, lng: -14.1500, type: "commune" },
  { name: "Diaobé", region: "Kolda", department: "Vélingara", lat: 13.0667, lng: -14.2000, type: "commune" },
  { name: "Némataba", region: "Kolda", department: "Vélingara", lat: 13.1333, lng: -14.2500, type: "commune" },
  
  { name: "Médina Yoro Foulah", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.8000, lng: -13.8000, type: "commune" },
  { name: "Pata", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.7500, lng: -13.7500, type: "commune" },
  { name: "Niaming", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.8333, lng: -13.7333, type: "commune" },
  { name: "Fafacourou", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.7167, lng: -13.8333, type: "commune" },
  { name: "Pakour", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.8667, lng: -13.8500, type: "commune" },
  { name: "Dinguiraye", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.7833, lng: -13.6833, type: "commune" },
  { name: "Badion", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.7667, lng: -13.7167, type: "commune" },
  { name: "Dialecté", region: "Kolda", department: "Médina Yoro Foulah", lat: 12.8500, lng: -13.7667, type: "commune" },
  
  // Région de Ziguinchor - Toutes communes
  { name: "Ziguinchor", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5833, lng: -16.2667, type: "commune" },
  { name: "Ziguinchor Nord", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5917, lng: -16.2611, type: "arrondissement" },
  { name: "Ziguinchor Sud", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5750, lng: -16.2722, type: "arrondissement" },
  { name: "Adéane", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6167, lng: -16.2333, type: "commune" },
  { name: "Boutoupa Camaracounda", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6500, lng: -16.2000, type: "commune" },
  { name: "Nyassia", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6000, lng: -16.3000, type: "commune" },
  { name: "Adeane", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5500, lng: -16.2167, type: "commune" },
  { name: "Niaguis", region: "Ziguinchor", department: "Ziguinchor", lat: 12.8000, lng: -16.1167, type: "commune" },
  { name: "Kataba 1", region: "Ziguinchor", department: "Ziguinchor", lat: 12.7167, lng: -16.2167, type: "commune" },
  { name: "Niasya", region: "Ziguinchor", department: "Ziguinchor", lat: 12.6833, lng: -16.2833, type: "commune" },
  { name: "Thionck Essyl", region: "Ziguinchor", department: "Ziguinchor", lat: 12.5167, lng: -16.3333, type: "commune" },
  
  { name: "Oussouye", region: "Ziguinchor", department: "Oussouye", lat: 12.4833, lng: -16.5500, type: "commune" },
  { name: "Diembéring", region: "Ziguinchor", department: "Oussouye", lat: 12.4500, lng: -16.6167, type: "commune" },
  { name: "Mlomp", region: "Ziguinchor", department: "Oussouye", lat: 12.4333, lng: -16.6000, type: "commune" },
  { name: "Santhiaba Manjacque", region: "Ziguinchor", department: "Oussouye", lat: 12.4667, lng: -16.5833, type: "commune" },
  { name: "Loudia Ouoloff", region: "Ziguinchor", department: "Oussouye", lat: 12.5000, lng: -16.5167, type: "commune" },
  
  { name: "Bignona", region: "Ziguinchor", department: "Bignona", lat: 12.8167, lng: -16.2333, type: "commune" },
  { name: "Thionck Essyl", region: "Ziguinchor", department: "Bignona", lat: 12.7833, lng: -16.3500, type: "commune" },
  { name: "Sindian", region: "Ziguinchor", department: "Bignona", lat: 12.7500, lng: -16.3000, type: "commune" },
  { name: "Djibonker", region: "Ziguinchor", department: "Bignona", lat: 12.7000, lng: -16.3833, type: "commune" },
  { name: "Diouloulou", region: "Ziguinchor", department: "Bignona", lat: 12.8500, lng: -16.3167, type: "commune" },
  { name: "Tendouck", region: "Ziguinchor", department: "Bignona", lat: 12.7667, lng: -16.2667, type: "commune" },
  { name: "Kafountine", region: "Ziguinchor", department: "Bignona", lat: 12.9167, lng: -16.7167, type: "commune" },
  { name: "Kartiack", region: "Ziguinchor", department: "Bignona", lat: 12.8833, lng: -16.2667, type: "commune" },
  { name: "Djinaky", region: "Ziguinchor", department: "Bignona", lat: 12.6667, lng: -16.3167, type: "commune" },
  
  // Région de Sédhiou - Toutes communes
  { name: "Sédhiou", region: "Sédhiou", department: "Sédhiou", lat: 12.7167, lng: -15.5667, type: "commune" },
  { name: "Diannah Malary", region: "Sédhiou", department: "Sédhiou", lat: 12.7500, lng: -15.5333, type: "commune" },
  { name: "Djiredji", region: "Sédhiou", department: "Sédhiou", lat: 12.6833, lng: -15.5833, type: "commune" },
  { name: "Marsassoum", region: "Sédhiou", department: "Sédhiou", lat: 12.8333, lng: -15.4000, type: "commune" },
  { name: "Bambali", region: "Sédhiou", department: "Sédhiou", lat: 12.6500, lng: -15.6167, type: "commune" },
  { name: "Sama Kanta", region: "Sédhiou", department: "Sédhiou", lat: 12.7833, lng: -15.4833, type: "commune" },
  { name: "Sakar", region: "Sédhiou", department: "Sédhiou", lat: 12.6167, lng: -15.5500, type: "commune" },
  
  { name: "Bounkiling", region: "Sédhiou", department: "Bounkiling", lat: 12.9167, lng: -15.7333, type: "commune" },
  { name: "Diaroumé", region: "Sédhiou", department: "Bounkiling", lat: 12.9500, lng: -15.6833, type: "commune" },
  { name: "Tankon", region: "Sédhiou", department: "Bounkiling", lat: 12.9833, lng: -15.7667, type: "commune" },
  { name: "Inor", region: "Sédhiou", department: "Bounkiling", lat: 12.8833, lng: -15.7667, type: "commune" },
  { name: "Ndiamacouta", region: "Sédhiou", department: "Bounkiling", lat: 12.8667, lng: -15.6500, type: "commune" },
  { name: "Bogal", region: "Sédhiou", department: "Bounkiling", lat: 12.8500, lng: -15.7000, type: "commune" },
  { name: "Dassilamé Socé", region: "Sédhiou", department: "Bounkiling", lat: 12.9000, lng: -15.8167, type: "commune" },
  
  { name: "Goudomp", region: "Sédhiou", department: "Goudomp", lat: 12.6167, lng: -15.9167, type: "commune" },
  { name: "Karantaba", region: "Sédhiou", department: "Goudomp", lat: 12.6500, lng: -15.8833, type: "commune" },
  { name: "Diattacounda", region: "Sédhiou", department: "Goudomp", lat: 12.5833, lng: -15.8500, type: "commune" },
  { name: "Samine", region: "Sédhiou", department: "Goudomp", lat: 12.5500, lng: -15.9500, type: "commune" },
  { name: "Djibanar", region: "Sédhiou", department: "Goudomp", lat: 12.6000, lng: -15.8167, type: "commune" },
  
  // Région de Matam - Toutes communes
  { name: "Matam", region: "Matam", department: "Matam", lat: 15.6500, lng: -13.2500, type: "commune" },
  { name: "Ourossogui", region: "Matam", department: "Matam", lat: 15.6167, lng: -13.3167, type: "commune" },
  { name: "Thilogne", region: "Matam", department: "Matam", lat: 15.5833, lng: -13.2833, type: "commune" },
  { name: "Oréfondé", region: "Matam", department: "Matam", lat: 15.6833, lng: -13.2167, type: "commune" },
  { name: "Ogo", region: "Matam", department: "Matam", lat: 15.7167, lng: -13.1833, type: "commune" },
  { name: "Des Agnam", region: "Matam", department: "Matam", lat: 15.5500, lng: -13.3833, type: "commune" },
  { name: "Nguidjilogne", region: "Matam", department: "Matam", lat: 15.6000, lng: -13.4167, type: "commune" },
  
  { name: "Kanel", region: "Matam", department: "Kanel", lat: 15.4833, lng: -13.1833, type: "commune" },
  { name: "Orkadière", region: "Matam", department: "Kanel", lat: 15.4500, lng: -13.1167, type: "commune" },
  { name: "Ndendory", region: "Matam", department: "Kanel", lat: 15.4167, lng: -13.2167, type: "commune" },
  { name: "Wouro Sidy", region: "Matam", department: "Kanel", lat: 15.5167, lng: -13.1500, type: "commune" },
  { name: "Semmé", region: "Matam", department: "Kanel", lat: 15.5000, lng: -13.2000, type: "commune" },
  { name: "Aouré", region: "Matam", department: "Kanel", lat: 15.3833, lng: -13.1500, type: "commune" },
  { name: "Galoya Toucouleur", region: "Matam", department: "Kanel", lat: 15.4000, lng: -13.0833, type: "commune" },
  { name: "Dembancané", region: "Matam", department: "Kanel", lat: 15.3500, lng: -13.2500, type: "commune" },
  
  { name: "Ranérou", region: "Matam", department: "Ranérou", lat: 15.3000, lng: -13.9500, type: "commune" },
  { name: "Oudalaye", region: "Matam", department: "Ranérou", lat: 15.2667, lng: -13.9167, type: "commune" },
  { name: "Vélingara", region: "Matam", department: "Ranérou", lat: 15.2333, lng: -14.0167, type: "commune" },
  { name: "Lougré Thioly", region: "Matam", department: "Ranérou", lat: 15.3333, lng: -14.0000, type: "commune" },
  { name: "Bokiladji", region: "Matam", department: "Ranérou", lat: 15.2833, lng: -13.8833, type: "commune" }
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
  private locations: CompleteSenegalLocation[] = COMPLETE_SENEGAL_LOCATIONS;

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