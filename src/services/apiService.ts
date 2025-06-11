
// src/services/apiService.ts

// On utilise le proxy configuré dans vite.config.ts
// BASE_URL n'est plus nécessaire car le proxy redirige /api vers le backend

export const api = {
  /**
   * Envoie les caractéristiques au modèle ML pour décider de l'arrosage.
   * @param features - TABLEAU ordonné de 15 valeurs numériques pour XGBoost.
   */
  arroserAvecML: async (features: number[]) => {
    try {
      console.log("🤖 Envoi requête ML vers Flask backend...");
      console.log("🔄 Requête vers: /api/arroser");
      console.log("📊 Features (tableau de 15 valeurs):", features);
      
      const res = await fetch(`/api/arroser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features }),
      });

      console.log("✅ Réponse reçue:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("❌ Erreur lors de l'appel à /api/arroser");
        throw new Error(`Erreur backend /arroser: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      console.error("❌ Erreur requête ML Flask:", error);
      throw error;
    }
  },

  /**
   * Démarre un arrosage manuel pendant une durée spécifiée.
   * @param durationMinutes - Durée de l'arrosage en minutes (par défaut 30).
   * @param scheduledBy - Origine de la demande ("MANUAL" par défaut).
   */
  startManualIrrigation: async (
    durationMinutes: number = 30,
    scheduledBy: string = "MANUAL"
  ) => {
    try {
      console.log("🚿 Démarrage irrigation manuelle...");
      const res = await fetch(`/api/irrigation/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          durationMinutes,
          scheduledBy,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log("✅ Réponse:", res.status, res.statusText);

      if (!res.ok) {
        console.error("❌ Erreur lors de l'appel à /api/irrigation/manual");
        throw new Error(`Erreur backend /irrigation/manual: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      console.error("❌ Erreur irrigation manuelle:", error);
      throw error;
    }
  },

  /**
   * Arrête l'arrosage en cours.
   */
  stopIrrigation: async () => {
    try {
      console.log("⏹️ Arrêt irrigation...");
      const res = await fetch(`/api/irrigation/stop`, {
        method: "POST",
      });

      console.log("✅ Réponse:", res.status, res.statusText);

      if (!res.ok) {
        console.error("❌ Erreur lors de l'appel à /api/irrigation/stop");
        throw new Error(`Erreur backend /irrigation/stop: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      console.error("❌ Erreur arrêt irrigation:", error);
      throw error;
    }
  },

  /**
   * Vérifie l'état de santé du backend.
   */
  checkHealth: async () => {
    try {
      console.log("🔍 Vérification santé backend...");
      const res = await fetch(`/api/health`);
      
      console.log("✅ Réponse:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("❌ Erreur vérification santé:", res.status, res.statusText);
        throw new Error(`Erreur santé backend: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("❌ Erreur de connexion avec le backend :", error);
      throw error;
    }
  },

  /**
   * Récupère les données météo pour une ville.
   * @param location - Nom de la ville.
   */
  getWeather: async (location: string) => {
    try {
      console.log("🌤️ Fetch météo pour:", location);
      const res = await fetch(`/api/weather/${location}`);
      
      if (!res.ok) {
        console.error(`❌ Erreur météo pour ${location}:`, res.status);
        throw new Error(`Erreur météo ${location}: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`❌ Erreur fetch météo pour ${location}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les données météo en temps réel pour une ville.
   * @param location - Nom de la ville.
   */
  getRealtimeWeather: async (location: string) => {
    try {
      console.log("⚡ Fetch météo temps réel pour:", location);
      const res = await fetch(`/api/weather/${location}/realtime`);
      
      if (!res.ok) {
        console.error(`❌ Erreur météo temps réel pour ${location}:`, res.status);
        throw new Error(`Erreur météo temps réel ${location}: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`❌ Erreur fetch météo temps réel pour ${location}:`, error);
      throw error;
    }
  }
};
