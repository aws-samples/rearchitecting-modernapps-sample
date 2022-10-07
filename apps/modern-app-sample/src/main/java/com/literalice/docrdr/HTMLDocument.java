package com.literalice.docrdr;

import java.io.Serializable;
import java.text.BreakIterator;
import java.util.Locale;
import java.util.UUID;
import java.util.function.Consumer;

import software.amazon.awssdk.services.translate.TranslateClient;
import software.amazon.awssdk.services.translate.model.TranslateException;
import software.amazon.awssdk.services.translate.model.TranslateTextRequest;
import software.amazon.awssdk.services.translate.model.TranslateTextResponse;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class HTMLDocument implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final TranslateClient translateClient = TranslateClient.create();

    private String id;
    private String title;
    private String translatedTitle;
    private String url;
    private String content;
    private String translatedContent;
    private String targetLanguage;

    HTMLDocument(String title, String url, String content, String targetLanguage) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.url = url;
        this.content = content;
        this.targetLanguage = targetLanguage;
    }

    HTMLDocument(String id, String translatedTitle, String url, String translatedContent, String targetLanguage) {
        this.id = id;
        this.url = url;
        this.translatedTitle = translatedTitle;
        this.translatedContent = translatedContent;
        this.targetLanguage = targetLanguage;
    }

    public String getId() {
        return this.id;
    }

    public String getContent() {
        return this.content;
    }

    public String getTitle() {
        return this.title;
    }

    public String getUrl() {
        return this.url;
    }

    public String getTranslatedTitle() {
        if (this.translatedTitle == null) {
            this.translatedTitle = translate(this.title, this.targetLanguage);
        }
        return this.translatedTitle;
    }

    public String getTranslatedContent() {
        if (this.translatedContent == null) {
            this.translatedContent = appendTranslatedText(toText(this.content), this.targetLanguage);
        }
        return this.translatedContent;
    }

    private static String translate(String text, String targetLanguage) {
        try {
            TranslateTextRequest request = TranslateTextRequest.builder()
                    .text(text)
                    .sourceLanguageCode("en")
                    .targetLanguageCode(targetLanguage)
                    .build();

            TranslateTextResponse result = translateClient.translateText(request);

            return result.translatedText();
        } catch (TranslateException e) {
            throw new RuntimeException(e);
        }
    }

    private static String appendTranslatedText(String text, String targetLanguage) {
        StringBuilder translatedTextBuilder = new StringBuilder();
        eachSegument(text, "en", (seg) -> {
            translatedTextBuilder
                    .append("<div lang='en'>")
                    .append(seg)
                    .append("</div>")
                    .append("<div lang='" + targetLanguage + "'>")
                    .append(translate(seg, targetLanguage))
                    .append("</div>");
        });
        return translatedTextBuilder.toString();
    }

    private static void eachSegument(final String text, final String lang, int batch, Consumer<String> func) {
        BreakIterator sentenceIterator = BreakIterator.getSentenceInstance(new Locale(lang));
        sentenceIterator.setText(text);
        int prevBoundary = sentenceIterator.first();
        int curBoundary = sentenceIterator.next();

        int currentBatch = 0;
        StringBuilder batchedSentence = new StringBuilder();
        while (curBoundary != BreakIterator.DONE) {
            String sentence = text.substring(prevBoundary, curBoundary);
            batchedSentence.append(sentence).append("\n");
            prevBoundary = curBoundary;
            curBoundary = sentenceIterator.next();

            currentBatch++;
            if (currentBatch > batch || curBoundary == BreakIterator.DONE) {
                func.accept(batchedSentence.toString());
                batchedSentence = new StringBuilder();
                currentBatch = 0;
            }
        }
    }

    private static void eachSegument(final String text, final String lang, Consumer<String> func) {
        eachSegument(text, lang, 5, func);
    }

    private static String toText(String documentHTML) {
        return Jsoup.clean(documentHTML, "", Safelist.none(), new Document.OutputSettings().prettyPrint(false));
    }
}
