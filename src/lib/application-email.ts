import type { ApplicationAnswer } from "@/types/application";

export function formatAnswersForEmail(answers: ApplicationAnswer[]) {
  if (!answers.length) return "";
  return answers
    .map((item, index) => `${index + 1}. ${item.question.trim()}\n\n${item.answer.trim()}`)
    .join("\n\n");
}

export function emailAlreadyHasAnswers(text: string, answers: ApplicationAnswer[]) {
  if (!text.trim() || !answers.length) return false;
  return answers.some((item) => {
    const question = item.question.trim();
    return question.length >= 12 && text.includes(question);
  });
}

export function emailBodyWithAnswers(coverLetter: string, answers: ApplicationAnswer[]) {
  const letter = coverLetter.trim();
  const qa = formatAnswersForEmail(answers);
  if (!qa) return letter;
  if (emailAlreadyHasAnswers(letter, answers)) return letter;
  return letter ? `${letter}\n\n${qa}` : qa;
}
