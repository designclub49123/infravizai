import { motion } from 'framer-motion';
import { Mic, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceCommandCenterFixed } from '@/components/voice/VoiceCommandCenterFixed';

export default function VoicePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-3.5rem)] p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            Voice Commands
          </h1>
          <p className="text-muted-foreground">
            Control infrastructure with AI-powered voice commands
          </p>
        </div>
        
        <VoiceCommandCenterFixed />
      </div>
    </motion.div>
  );
}
