
import { useCallback } from 'react';
import { PublishOptions, MQTTMessage } from '@/types/mqtt';

export const useMQTTPublisher = (
  isConnected: boolean,
  clientRef: React.MutableRefObject<any>,
  setMessages: React.Dispatch<React.SetStateAction<MQTTMessage[]>>
) => {
  const publishMessage = useCallback((topic: string, message: string, options?: PublishOptions) => {
    console.log('🚀 [MQTT DEBUG] Début publication...');
    console.log('🌐 [MQTT DEBUG] Statut connexion:', isConnected);
    console.log('🔗 [MQTT DEBUG] Client existe:', !!clientRef.current);
    console.log('📍 [MQTT DEBUG] Topic cible:', topic);
    console.log('📦 [MQTT DEBUG] Message à envoyer:', message);
    
    if (!isConnected || !clientRef.current) {
      console.error('❌ [MQTT DEBUG] ÉCHEC - Pas de connexion au broker');
      console.error('❌ [MQTT DEBUG] isConnected:', isConnected);
      console.error('❌ [MQTT DEBUG] clientRef.current:', !!clientRef.current);
      return false;
    }

    try {
      const publishOptions = {
        qos: (options?.qos || 1) as 0 | 1 | 2,
        retain: options?.retain || false
      };
      
      console.log('📤 [MQTT DEBUG] Options de publication:', publishOptions);
      console.log('📤 [MQTT DEBUG] Tentative d\'envoi vers broker JHipster...');
      
      clientRef.current.publish(topic, message, publishOptions, (error: any) => {
        if (error) {
          console.error('❌ [MQTT DEBUG] ERREUR lors de la publication:', error);
          console.error('❌ [MQTT DEBUG] Type erreur:', typeof error);
          console.error('❌ [MQTT DEBUG] Message erreur:', error.message);
        } else {
          console.log('✅ [MQTT DEBUG] Message publié avec SUCCÈS!');
          console.log('✅ [MQTT DEBUG] Topic:', topic);
          console.log('✅ [MQTT DEBUG] Contenu:', message);
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      console.log('📤 [MQTT DEBUG] Commande publish() exécutée');
      return true;
    } catch (error) {
      console.error('❌ [MQTT DEBUG] EXCEPTION lors de la publication:', error);
      return false;
    }
  }, [isConnected, clientRef, setMessages]);

  return { publishMessage };
};
