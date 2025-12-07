import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Attachment } from "../hooks/use-attachments-hook";

// ============================================================================
// TYPES
// ============================================================================

interface DocumentViewerModalProps {
  visible: boolean;
  attachment: Attachment;
  onClose: () => void;
}

type DocumentSource = {
  type: "local" | "remote";
  data: string; // base64 para local, URL para remote
};

// ============================================================================
// CONSTANTS
// ============================================================================

const PDF_JS_VERSION = "3.12.313";
const PDF_JS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`;

const VIEWER_COLORS = {
  background: "#525659",
  loadingBg: "#ffffff",
  errorIcon: "#999999",
};

// ============================================================================
// UTILITIES
// ============================================================================

const isRemoteUrl = (uri: string): boolean => {
  return uri.startsWith("http://") || uri.startsWith("https://");
};

const getGoogleDocsViewerUrl = (url: string): string => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`;
};

const generatePdfViewerHtml = (base64Data: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <script src="${PDF_JS_CDN}/pdf.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: auto;
            background-color: ${VIEWER_COLORS.background};
          }
          #canvas-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 16px 0;
          }
          canvas {
            margin-bottom: 16px;
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
            max-width: 100%;
            height: auto;
          }
          .error-message {
            color: white;
            font-size: 16px;
            text-align: center;
            margin-top: 20px;
            padding: 0 20px;
          }
        </style>
      </head>
      <body>
        <div id="canvas-container"></div>
        <script>
          try {
            const pdfData = atob("${base64Data}");
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDF_JS_CDN}/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            
            loadingTask.promise.then(pdf => {
              const container = document.getElementById('canvas-container');
              
              // Renderiza todas as páginas
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(page => {
                  const viewport = page.getViewport({ scale: 1.5 });
                  const canvas = document.createElement('canvas');
                  canvas.width = viewport.width;
                  canvas.height = viewport.height;
                  
                  const ctx = canvas.getContext('2d');
                  page.render({ 
                    canvasContext: ctx, 
                    viewport: viewport 
                  });
                  
                  container.appendChild(canvas);
                }).catch(err => {
                  console.error('Erro ao renderizar página ' + pageNum, err);
                });
              }
            }).catch(err => {
              document.body.innerHTML = "<p class='error-message'>Erro ao carregar PDF: " + err.message + "</p>";
              console.error('Erro ao carregar PDF:', err);
            });
          } catch (err) {
            document.body.innerHTML = "<p class='error-message'>Erro ao processar PDF</p>";
            console.error('Erro crítico:', err);
          }
        </script>
      </body>
    </html>
  `;
};

// ============================================================================
// HOOKS
// ============================================================================

const useDocumentSource = (visible: boolean, uri: string) => {
  const [source, setSource] = useState<DocumentSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSource(null);
      setIsLoading(true);
      setError(false);
      return;
    }

    const prepareDocument = async () => {
      try {
        setIsLoading(true);
        setError(false);

        if (isRemoteUrl(uri)) {
          // Para URLs remotas, usa Google Docs Viewer diretamente
          setSource({
            type: "remote",
            data: getGoogleDocsViewerUrl(uri),
          });
        } else {
          // Para arquivos locais, lê como base64
          const file = new FileSystem.File(uri);
          const base64 = await file.base64();
          setSource({
            type: "local",
            data: base64,
          });
        }
      } catch (err) {
        console.error("Error preparing document:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    prepareDocument();
  }, [visible, uri]);

  return { source, isLoading, error };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const DocumentHeader: React.FC<{
  fileName: string;
  onClose: () => void;
  onOpenExternal: () => void;
}> = ({ fileName, onClose, onOpenExternal }) => (
  <View className="bg-white border-b border-gray-200 px-4 py-3">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 mr-2">
        <TouchableOpacity onPress={onClose} className="mr-3 p-1">
          <MaterialIcons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <MaterialIcons name="picture-as-pdf" size={24} color="#ef4444" />
        <Text
          className="ml-2 text-base font-medium text-gray-800 flex-1"
          numberOfLines={1}
        >
          {fileName || "Documento.pdf"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onOpenExternal}
        className="flex-row items-center bg-blue-500 px-3 py-2 rounded-lg"
      >
        <MaterialIcons name="open-in-new" size={18} color="white" />
        <Text className="ml-1 text-white text-sm font-medium">Abrir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const LoadingView: React.FC = () => (
  <View className="absolute inset-0 justify-center items-center bg-white">
    <ActivityIndicator size="large" color="#3b82f6" />
    <Text className="text-gray-600 mt-4">Carregando documento...</Text>
  </View>
);

const ErrorView: React.FC<{ onOpenExternal: () => void }> = ({
  onOpenExternal,
}) => (
  <View className="flex-1 justify-center items-center px-6 bg-white">
    <MaterialIcons
      name="error-outline"
      size={64}
      color={VIEWER_COLORS.errorIcon}
    />
    <Text className="text-gray-600 text-center mt-4 mb-2 text-base font-medium">
      Não foi possível visualizar o documento
    </Text>
    <Text className="text-gray-500 text-center mb-6 text-sm">
      Toque no botão abaixo para abrir com outro aplicativo
    </Text>
    <TouchableOpacity
      onPress={onOpenExternal}
      className="bg-blue-500 px-6 py-3 rounded-lg"
    >
      <Text className="text-white font-medium">Abrir com outro app</Text>
    </TouchableOpacity>
  </View>
);

const InfoBanner: React.FC = () => (
  <View className="bg-blue-50 px-4 py-3 border-t border-blue-100">
    <View className="flex-row items-center">
      <MaterialIcons name="info-outline" size={18} color="#3B82F6" />
      <Text className="text-xs text-blue-700 ml-2 flex-1">
        Use dois dedos para dar zoom. Toque em "Abrir" para mais recursos.
      </Text>
    </View>
  </View>
);

const DocumentViewer: React.FC<{
  source: DocumentSource;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onError: () => void;
}> = ({ source, onLoadStart, onLoadEnd, onError }) => {
  if (source.type === "local") {
    return (
      <WebView
        source={{ html: generatePdfViewerHtml(source.data) }}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onError}
        style={{ flex: 1, backgroundColor: VIEWER_COLORS.background }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        allowFileAccess
        mixedContentMode="always"
      />
    );
  }

  return (
    <WebView
      source={{ uri: source.data }}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onError}
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      javaScriptEnabled
      domStorageEnabled
      scalesPageToFit
      originWhitelist={["*"]}
      mixedContentMode="always"
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  visible,
  attachment,
  onClose,
}) => {
  const { source, isLoading, error } = useDocumentSource(
    visible,
    attachment.uri
  );
  const [webViewLoading, setWebViewLoading] = useState(true);

  const handleOpenExternal = async () => {
    try {
      const canOpen = await Linking.canOpenURL(attachment.uri);
      if (canOpen) {
        await Linking.openURL(attachment.uri);
      } else {
        Alert.alert(
          "Não foi possível abrir",
          "Nenhum aplicativo disponível para abrir este arquivo"
        );
      }
    } catch (err) {
      console.error("Open external error:", err);
      Alert.alert("Erro", "Não foi possível abrir o documento externamente");
    }
  };

  if (!visible) return null;

  const showLoading = isLoading || webViewLoading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FFF",
        }}
      >
        <View className="flex-1">
          <DocumentHeader
            fileName={attachment.name || "Documento.pdf"}
            onClose={onClose}
            onOpenExternal={handleOpenExternal}
          />

          <View className="flex-1 bg-gray-700">
            {error ? (
              <ErrorView onOpenExternal={handleOpenExternal} />
            ) : source ? (
              <>
                <DocumentViewer
                  source={source}
                  onLoadStart={() => setWebViewLoading(true)}
                  onLoadEnd={() => setWebViewLoading(false)}
                  onError={() => setWebViewLoading(false)}
                />
                {showLoading && <LoadingView />}
              </>
            ) : null}
          </View>

          {!error && !showLoading && <InfoBanner />}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
