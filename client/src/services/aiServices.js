import api from "./api";

const architectureAssist = async (shapes, arrows) => {
  const response = await api.post("/ai/assist", { shapes, arrows });
  return response.data.data;
};

const messCleanup = async (shapes, arrows) => {
  const response = await api.post("/ai/cleanup", { shapes, arrows });
  return response.data.data;
};

const generateCode = async (detailed_analysis, codeType, selectedLanguage) => {
  const response = await api.post("/ai/generate-code", {
    detailed_analysis: detailed_analysis,
    code_type: codeType,
    language: selectedLanguage,
  });
  return response.data.data;
};
const textTodiagram = async (
  description,
  startX = 100,
  startY = 100,
  selectedType = "auto",
) => {
  const response = await api.post("ai/text-to-diagram", {
    description,
    startX,
    startY,
    selectedType,
  });
  return response.data.data;
};
export { architectureAssist, messCleanup, textTodiagram, generateCode };
