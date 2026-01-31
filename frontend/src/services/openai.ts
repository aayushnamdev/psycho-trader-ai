/**
 * OpenAI GPT API service for AI-powered journal features
 */

// AI Action Types
export type AIActionType =
  | 'ask'
  | 'go_deeper'
  | 'coach_me'
  | 'summarize'
  | 'get_perspective'
  | 'past_patterns'
  | 'action_items';

export interface AIResponse {
  content: string;
  type: AIActionType;
}

// System prompts for different AI actions
const SYSTEM_PROMPTS: Record<AIActionType, string> = {
  ask: `You are a thoughtful journal companion. The user has written a journal entry and wants to explore it further.
Ask 2-3 insightful, open-ended questions that help them reflect deeper on their thoughts and feelings.
Be warm, curious, and non-judgmental. Focus on emotions, motivations, and underlying patterns.`,

  go_deeper: `You are a reflective journal guide. The user wants to explore their entry more deeply.
Help them uncover the layers beneath their surface thoughts. Ask probing questions about:
- What emotions are present but not explicitly stated?
- What assumptions or beliefs might be influencing their perspective?
- What connections exist to past experiences?
Keep your response conversational and supportive.`,

  coach_me: `You are an empathetic trading psychology coach. The user has shared their thoughts/experiences.
Provide supportive coaching that:
- Validates their feelings
- Offers constructive reframes when helpful
- Suggests practical mindset shifts
- Encourages self-compassion
Keep advice actionable and specific to trading psychology. Be encouraging but realistic.`,

  summarize: `You are a concise summarizer. Create a brief, insightful summary of the journal entry that:
- Captures the main themes and emotions
- Highlights key insights or realizations
- Notes any patterns or recurring thoughts
Keep it to 2-3 sentences maximum. Be accurate and thoughtful.`,

  get_perspective: `You are a wise advisor offering fresh perspectives. The user wants to see their situation differently.
Offer 2-3 alternative ways to view their situation:
- Consider different angles they might not have thought of
- Reframe challenges as opportunities where appropriate
- Share wisdom about similar situations
Be respectful of their experience while gently expanding their viewpoint.`,

  past_patterns: `You are a pattern analyst for trading psychology. Based on this journal entry:
- Identify any recurring emotional or behavioral patterns
- Note triggers or situations that seem to repeat
- Highlight growth areas and blind spots
- Connect current experiences to potential past patterns
Be specific and use evidence from the entry. Frame observations constructively.`,

  action_items: `You are a practical action planner. Based on this journal entry, suggest:
- 2-3 specific, actionable next steps
- Small experiments they could try
- Habits or practices that might help
Make actions concrete, achievable, and relevant to their specific situation.
Each action should be something they can do in the next 24-48 hours.`,
};

// Action display names and icons
export const AI_ACTIONS: Array<{
  type: AIActionType;
  label: string;
  icon: string;
}> = [
  { type: 'ask', label: 'Ask', icon: 'sparkles' },
  { type: 'go_deeper', label: 'Go Deeper', icon: 'layers' },
  { type: 'coach_me', label: 'Coach Me', icon: 'heart' },
  { type: 'summarize', label: 'Summarize', icon: 'file-text' },
  { type: 'get_perspective', label: 'Get Perspective', icon: 'eye' },
  { type: 'past_patterns', label: 'Past Patterns', icon: 'git-branch' },
  { type: 'action_items', label: 'Actions', icon: 'check-square' },
];

/**
 * Call OpenAI GPT API for journal AI features
 */
export const callOpenAI = async (
  journalContent: string,
  actionType: AIActionType,
  apiKey: string
): Promise<AIResponse> => {
  const systemPrompt = SYSTEM_PROMPTS[actionType];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is my journal entry:\n\n${journalContent}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get AI response');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    type: actionType,
  };
};

/**
 * Get inspiration prompt for journaling
 */
export const getInspirationPrompt = async (apiKey: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a thoughtful journaling prompt generator focused on trading psychology.
Generate a single, engaging journaling prompt that helps traders reflect on their:
- Emotional patterns during trading
- Decision-making processes
- Risk tolerance and management
- Growth and learning from trades
- Mindset and mental preparation

The prompt should be:
- Open-ended and thought-provoking
- Specific enough to guide reflection
- Encouraging self-awareness
- 1-2 sentences maximum

Just return the prompt, nothing else.`,
        },
        { role: 'user', content: 'Give me a journaling prompt.' },
      ],
      temperature: 0.9,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get inspiration prompt');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export default {
  callOpenAI,
  getInspirationPrompt,
  AI_ACTIONS,
};
