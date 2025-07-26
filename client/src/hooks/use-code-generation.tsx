import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GenerateCodeRequest {
  prompt: string;
  language: string;
  fileName: string;
}

interface GenerateCodeResponse {
  code: string;
  language: string;
  fileName: string;
  confidence: number;
}

export function useCodeGeneration() {
  const queryClient = useQueryClient();

  const generateCodeMutation = useMutation({
    mutationFn: async ({ prompt, language, fileName }: GenerateCodeRequest): Promise<GenerateCodeResponse> => {
      const response = await apiRequest("POST", "/api/generate-code", {
        prompt,
        language,
        fileName,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/code-generations"] });
    },
  });

  const saveCodeGeneration = async (generation: any) => {
    try {
      await apiRequest("POST", "/api/code-generations", generation);
    } catch (error) {
      console.error("Failed to save code generation:", error);
    }
  };

  const generateCode = async (prompt: string, language: string, fileName: string) => {
    // Process the prompt to determine the appropriate file name and language if not specified
    const processedData = processVoicePrompt(prompt, language, fileName);
    
    const result = await generateCodeMutation.mutateAsync({ 
      prompt, 
      language: processedData.language, 
      fileName: processedData.fileName 
    });
    
    // Save to history
    await saveCodeGeneration({
      generatedCode: result.code,
      language: result.language,
      fileName: result.fileName,
      filePath: `/${result.fileName}`,
      approved: false,
      applied: false,
    });

    return result;
  };

  // Process voice prompt to determine appropriate language and file name
  const processVoicePrompt = (prompt: string, defaultLanguage: string, defaultFileName: string) => {
    const lowerPrompt = prompt.toLowerCase();
    let language = defaultLanguage;
    let fileName = defaultFileName;

    // Auto-detect language from voice command
    if (lowerPrompt.includes('python') || lowerPrompt.includes('py')) {
      language = 'python';
      fileName = fileName.endsWith('.py') ? fileName : 'main.py';
    } else if (lowerPrompt.includes('javascript') || lowerPrompt.includes('js') || lowerPrompt.includes('node')) {
      language = 'javascript';
      fileName = fileName.endsWith('.js') ? fileName : 'main.js';
    } else if (lowerPrompt.includes('java') && !lowerPrompt.includes('javascript')) {
      language = 'java';
      fileName = fileName.endsWith('.java') ? fileName : 'Main.java';
    } else if (lowerPrompt.includes('c++') || lowerPrompt.includes('cpp')) {
      language = 'cpp';
      fileName = fileName.endsWith('.cpp') ? fileName : 'main.cpp';
    } else if (lowerPrompt.includes('c#') || lowerPrompt.includes('csharp')) {
      language = 'csharp';
      fileName = fileName.endsWith('.cs') ? fileName : 'Program.cs';
    } else if (lowerPrompt.includes('html')) {
      language = 'html';
      fileName = fileName.endsWith('.html') ? fileName : 'index.html';
    } else if (lowerPrompt.includes('css')) {
      language = 'css';
      fileName = fileName.endsWith('.css') ? fileName : 'styles.css';
    }

    // Auto-detect file name from voice command
    const fileNameMatch = lowerPrompt.match(/file\s+(?:named|called)\s+(\w+(?:\.\w+)?)/);
    if (fileNameMatch) {
      fileName = fileNameMatch[1];
    }

    // Auto-detect app type and suggest appropriate file names
    if (lowerPrompt.includes('app.py') || lowerPrompt.includes('application python')) {
      fileName = 'app.py';
      language = 'python';
    } else if (lowerPrompt.includes('app.js') || lowerPrompt.includes('application javascript')) {
      fileName = 'app.js';
      language = 'javascript';
    } else if (lowerPrompt.includes('app.java') || lowerPrompt.includes('application java')) {
      fileName = 'App.java';
      language = 'java';
    }

    return { language, fileName };
  };

  return {
    generateCode,
    isGenerating: generateCodeMutation.isPending,
    error: generateCodeMutation.error,
  };
}
