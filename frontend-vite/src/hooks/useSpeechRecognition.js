// import { useState, useEffect, useRef } from 'react';

// export const useSpeechRecognition = () => {
//   const [transcript, setTranscript]   = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [isSupported, setIsSupported] = useState(false);
//   const recognitionRef                = useRef<any>(null);

//   useEffect(() => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition;

//     if (SpeechRecognition) {
//       setIsSupported(true);
//       const recognition          = new SpeechRecognition();
//       recognition.continuous     = true;
//       recognition.interimResults = true;
//       recognition.lang           = 'en-US';

//       recognition.onresult = (event: any) => {
//         let full = '';
//         for (let i = 0; i < event.results.length; i++) {
//           full += event.results[i][0].transcript;
//         }
//         setTranscript(full);
//       };

//       recognition.onerror = () => setIsListening(false);
//       recognition.onend   = () => setIsListening(false);
//       recognitionRef.current = recognition;
//     }
//   }, []);

//   const startListening = () => {
//     if (recognitionRef.current) {
//       setTranscript('');
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     }
//   };

//   return {
//     transcript,
//     isListening,
//     isSupported,
//     startListening,
//     stopListening,
//     setTranscript
//   };
// };


import { useState, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(true); 
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const stopListening = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setTranscript('');
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Deepgram API Configuration
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      const socket = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&filler_words=true&smart_format=true&interim_results=true',
        ['token', apiKey]
      );

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250); // send audio data every 250ms
      };

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        const receivedTranscript = data.channel.alternatives[0].transcript;
        
        if (receivedTranscript && data.is_final) {
          setTranscript((prev) => prev + ' ' + receivedTranscript);
        }
      };

      socket.onerror = (err) => {
        console.error('Deepgram WebSocket Error:', err);
        stopListening();
      };

      socket.onclose = () => {
        setIsListening(false);
      };

      socketRef.current = socket;

    } catch (err) {
      console.error('Mic Access Error:', err);
      setIsListening(false);
    }
  }, [stopListening]);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    setTranscript
  };
};