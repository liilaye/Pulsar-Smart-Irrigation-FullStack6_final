// src/services/apiService.ts

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";

export const api = {
  /**
   * Envoie les caractéristiques au modèle ML pour décider de l’arrosage.
   * @param features - Les données d'entrée pour le modèle ML.
   */
  arroserAvecML: async (features: Record<string, any>) => {
    const res = await fetch(`${BASE_URL}/api/arroser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ features }),
    });

    if (!res.ok) {
      console.error("Erreur lors de l'appel à /api/arroser");
      throw new Error("Erreur backend /arroser");
    }

    return res.json();
  },

  /**
   * Démarre un arrosage manuel pendant une durée spécifiée.
   * @param durationMinutes - Durée de l’arrosage en minutes (par défaut 30).
   * @param scheduledBy - Origine de la demande ("MANUAL" par défaut).
   */
  startManualIrrigation: async (
    durationMinutes: number = 30,
    scheduledBy: string = "MANUAL"
  ) => {
    const res = await fetch(`${BASE_URL}/api/irrigation/manual`, {
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

    if (!res.ok) {
      console.error("Erreur lors de l'appel à /api/irrigation/manual");
      throw new Error("Erreur backend /irrigation/manual");
    }

    return res.json();
  },

  /**
   * Arrête l’arrosage en cours.
   */
  stopIrrigation: async () => {
    const res = await fetch(`${BASE_URL}/api/irrigation/stop`, {
      method: "POST",
    });

    if (!res.ok) {
      console.error("Erreur lors de l'appel à /api/irrigation/stop");
      throw new Error("Erreur backend /irrigation/stop");
    }

    return res.json();
  },

  /**
   * Vérifie l'état de santé du backend.
   */
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (!res.ok) throw new Error("Erreur santé backend");
      return await res.json();
    } catch (error) {
      console.error("❌ Erreur de connexion avec le backend :", error);
      throw error;
    }
  },
};
