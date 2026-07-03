package com.savora.demo.service.Request;

import java.io.IOException;
import java.net.URI;
import java.text.Normalizer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class invokeLLM {

        private final RestTemplate restTemplate = new RestTemplate();
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Value("${ollama.base-url:http://localhost:11434}")
        private String ollamaBaseUrl;

        @Value("${ollama.model:llama3.2:3b}")
        private String ollamaModel;

        @Value("${ai.provider:openrouter}")
        private String aiProvider;

        @Value("${openrouter.base-url:https://openrouter.ai/api/v1}")
        private String openRouterBaseUrl;

        @Value("${openrouter.model:poolside/laguna-xs-2.1:free}")
        private String openRouterModel;

        @Value("${openrouter.api-key:}")
        private String openRouterApiKey;

        @Value("${openrouter.app-name:Savora}")
        private String openRouterAppName;

        @Value("${openrouter.app-url:https://example.com}")
        private String openRouterAppUrl;

        public Map<String, Object> generateRecipe(String prompt, List<String> fileUrls) {
                List<String> safeFileUrls = fileUrls == null ? List.of() : fileUrls;
                try {
                        String provider = StringUtils.hasText(aiProvider) ? aiProvider.trim().toLowerCase()
                                        : "openrouter";
                        String content = "ollama".equals(provider)
                                        ? callOllama(prompt, safeFileUrls)
                                        : callOpenRouter(prompt, safeFileUrls);
                        return parseRecipeJson(content);
                } catch (ResourceAccessException ex) {
                        if ("ollama".equalsIgnoreCase(aiProvider)) {
                                throw new RuntimeException(
                                                "Cannot reach Ollama at " + ollamaBaseUrl
                                                                + ". Start it with 'ollama serve' and pull model '"
                                                                + ollamaModel + "'.",
                                                ex);
                        }
                        throw new RuntimeException(
                                        "Cannot reach OpenRouter at " + openRouterBaseUrl
                                                        + ". Check network access and OPENROUTER_API_KEY.",
                                        ex);
                } catch (Exception ex) {
                        throw new RuntimeException("Failed to generate recipe: " + ex.getMessage(), ex);
                }
        }

        public String analyzeImage(String imageUrl) {
                Map<String, Object> result = generateRecipe(
                                "Analyze this image and generate a recipe as valid JSON.",
                                List.of(imageUrl));
                try {
                        return objectMapper.writeValueAsString(result);
                } catch (JsonProcessingException ex) {
                        throw new RuntimeException("Failed to serialize AI response", ex);
                }
        }

        private String callOpenRouter(String prompt, List<String> fileUrls) {
                if (!StringUtils.hasText(openRouterApiKey)) {
                        throw new RuntimeException(
                                        "Missing OpenRouter API key. Set environment variable OPENROUTER_API_KEY (or openrouter.api-key).");
                }

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", openRouterModel);

                Map<String, Object> message = new HashMap<>();
                message.put("role", "user");
                message.put("content", buildOpenRouterContent(prompt, fileUrls));
                requestBody.put("messages", List.of(message));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openRouterApiKey);
                headers.set("HTTP-Referer", openRouterAppUrl);
                headers.set("X-Title", openRouterAppName);

                ResponseEntity<Map> response = restTemplate.postForEntity(
                                openRouterBaseUrl + "/chat/completions",
                                new HttpEntity<>(requestBody, headers),
                                Map.class);

                Object choicesObj = response.getBody() == null ? null : response.getBody().get("choices");
                if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()
                                || !(choices.get(0) instanceof Map<?, ?> firstChoice)) {
                        throw new RuntimeException("OpenRouter response did not contain choices[0]");
                }

                Object messageObj = firstChoice.get("message");
                if (!(messageObj instanceof Map<?, ?> responseMessage)) {
                        throw new RuntimeException("OpenRouter response did not contain message");
                }

                Object contentObj = responseMessage.get("content");
                String content = Objects.toString(contentObj, "").trim();
                if (!StringUtils.hasText(content)) {
                        throw new RuntimeException("OpenRouter response did not contain message.content");
                }
                return content;
        }

        private String callOllama(String prompt, List<String> fileUrls) throws IOException {
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", ollamaModel);
                requestBody.put("stream", false);
                requestBody.put("format", "json");

                Map<String, Object> message = new HashMap<>();
                message.put("role", "user");
                message.put("content", buildInstructionPrompt(prompt, !fileUrls.isEmpty()));

                List<String> images = encodeImages(fileUrls);
                if (!images.isEmpty()) {
                        message.put("images", images);
                }

                requestBody.put("messages", List.of(message));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                ResponseEntity<Map> response = restTemplate.postForEntity(
                                ollamaBaseUrl + "/api/chat",
                                new HttpEntity<>(requestBody, headers),
                                Map.class);

                Object messageObj = response.getBody() == null ? null : response.getBody().get("message");
                if (!(messageObj instanceof Map<?, ?> messageMap) || messageMap.get("content") == null) {
                        throw new RuntimeException("Ollama response did not contain message.content");
                }

                return String.valueOf(messageMap.get("content"));
        }

        private String buildInstructionPrompt(String prompt, boolean imageMode) {
                String safePrompt = StringUtils.hasText(prompt) ? prompt.trim() : "";
                String normalizedPrompt = normalizeAsciiFold(safePrompt);

                String baseInstruction = imageMode
                                ? "Look at the provided image, identify visible ingredients, and produce one realistic recipe."
                                : "Generate one realistic cooking recipe from the user request.";

                return baseInstruction + "\n"
                                + "User request (original language): " + safePrompt + "\n"
                                + "User request (normalized form for internal matching only, do NOT prioritize over original): "
                                + normalizedPrompt + "\n"
                                + "Important language rules:\n"
                                + "- Support ALL human languages equally (including Vietnamese, English, Korean, Japanese, Chinese, Thai, Arabic, etc.).\n"
                                + "- Preserve the user's original language in ALL output fields whenever possible (name, description, ingredients, steps, tags).\n"
                                + "- Do NOT translate or force conversion to English unless the user explicitly requests it.\n"
                                + "- Treat diacritics and non-diacritics as equivalent for understanding intent (e.g., 'phở' == 'pho'), but ALWAYS prefer original spelling in output.\n"
                                + "- normalizedPrompt is ONLY for understanding intent, never for output generation.\n"
                                + "- category MUST be one of: breakfast, lunch, dinner, snack, dessert, drink.\n"
                                + "- If user mixes languages, preserve mixed-language style in output.\n"
                                + "- Ingredients and steps may be written in any language depending on user input.\n"
                                + "- Ensure cultural food names remain authentic (do not anglicize local dishes).\n"
                                + "- Always return ONLY valid JSON (no markdown, no explanation).\n"
                                + "- JSON structure must be exactly:\n"
                                + "{"
                                + "\"name\": string,"
                                + "\"description\": string,"
                                + "\"category\": \"breakfast\"|\"lunch\"|\"dinner\"|\"snack\"|\"dessert\"|\"drink\","
                                + "\"servings\": number,"
                                + "\"prep_time\": number,"
                                + "\"cook_time\": number,"
                                + "\"ingredients\": [{\"name\": string, \"amount\": string}],"
                                + "\"steps\": [string],"
                                + "\"tags\": [string]"
                                + "}"
                                + "\nNo markdown fences, no commentary.";
        }

        private String normalizeAsciiFold(String input) {
                if (!StringUtils.hasText(input)) {
                        return "";
                }
                String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
                return normalized.replaceAll("\\p{M}+", "");
        }

        private Object buildOpenRouterContent(String prompt, List<String> fileUrls) {
                String instruction = buildInstructionPrompt(prompt, !fileUrls.isEmpty());
                if (fileUrls.isEmpty()) {
                        return instruction;
                }

                List<Map<String, Object>> content = new ArrayList<>();

                Map<String, Object> textPart = new HashMap<>();
                textPart.put("type", "text");
                textPart.put("text", instruction);
                content.add(textPart);

                for (String fileUrl : fileUrls) {
                        if (!StringUtils.hasText(fileUrl)) {
                                continue;
                        }

                        Map<String, Object> imagePart = new HashMap<>();
                        imagePart.put("type", "image_url");

                        Map<String, Object> imageUrl = new HashMap<>();
                        imageUrl.put("url", fileUrl);
                        imagePart.put("image_url", imageUrl);

                        content.add(imagePart);
                }

                return content;
        }

        private List<String> encodeImages(List<String> fileUrls) throws IOException {
                List<String> encodedImages = new ArrayList<>();
                for (String fileUrl : fileUrls) {
                        if (!StringUtils.hasText(fileUrl)) {
                                continue;
                        }

                        String relativePath = URI.create(fileUrl).getPath();
                        if (!relativePath.startsWith("/uploads/")) {
                                continue;
                        }

                        Path filePath = Paths.get("uploads", relativePath.substring("/uploads/".length()))
                                        .toAbsolutePath()
                                        .normalize();
                        if (!Files.exists(filePath)) {
                                continue;
                        }

                        encodedImages.add(Base64.getEncoder().encodeToString(Files.readAllBytes(filePath)));
                }
                return encodedImages;
        }

        private Map<String, Object> parseRecipeJson(String content) throws JsonProcessingException {
                String normalized = content == null ? "" : content.trim();
                if (normalized.startsWith("```") && normalized.endsWith("```")) {
                        normalized = normalized.replaceFirst("^```json", "").replaceFirst("^```", "");
                        normalized = normalized.substring(0, normalized.lastIndexOf("```"));
                        normalized = normalized.trim();
                }

                JsonNode root = objectMapper.readTree(normalized);
                Map<String, Object> recipe = new HashMap<>();
                recipe.put("name", readText(root, "name", "Savora Recipe"));
                recipe.put("description", readText(root, "description", "Generated by local Ollama."));
                recipe.put("category", readText(root, "category", "lunch").toLowerCase());
                recipe.put("servings", readInt(root, "servings", 4));
                recipe.put("prep_time", readInt(root, "prep_time", 15));
                recipe.put("cook_time", readInt(root, "cook_time", 25));
                recipe.put("ingredients", readIngredients(root.path("ingredients")));
                recipe.put("steps", readStringArray(root.path("steps")));
                recipe.put("tags", readStringArray(root.path("tags")));
                return recipe;
        }

        private String readText(JsonNode root, String field, String fallback) {
                JsonNode node = root.path(field);
                return node.isTextual() && StringUtils.hasText(node.asText()) ? node.asText() : fallback;
        }

        private int readInt(JsonNode root, String field, int fallback) {
                JsonNode node = root.path(field);
                return node.isNumber() ? node.asInt() : fallback;
        }

        private List<Map<String, String>> readIngredients(JsonNode ingredientsNode) {
                List<Map<String, String>> ingredients = new ArrayList<>();
                if (!ingredientsNode.isArray()) {
                        return ingredients;
                }

                for (JsonNode ingredientNode : ingredientsNode) {
                        Map<String, String> ingredient = new HashMap<>();
                        ingredient.put("name", ingredientNode.path("name").asText("ingredient"));
                        ingredient.put("amount", ingredientNode.path("amount").asText("to taste"));
                        ingredients.add(ingredient);
                }
                return ingredients;
        }

        private List<String> readStringArray(JsonNode node) {
                if (!node.isArray()) {
                        return List.of();
                }
                return objectMapper.convertValue(node, new TypeReference<List<String>>() {
                });
        }
}