import { create } from 'zustand';

export type BubbleEdge =
    | 'bottom-left'
    | 'top-left'
    | 'top-right'
    | 'left-center'
    | 'right-center';

export interface BubbleState {
    /** Whether the bubble is currently visible. */
    isOpen: boolean;
    /** Whether the mini chat panel (expanded bubble) is visible. */
    isExpanded: boolean;
    /** The active conversation ID in the bubble. */
    conversationId: number | null;
    /** Edge position of the bubble. */
    edge: BubbleEdge;

    // Actions
    openBubble: (conversationId: number) => void;
    closeBubble: () => void;
    toggleExpanded: () => void;
    setExpanded: (expanded: boolean) => void;
    setEdge: (edge: BubbleEdge) => void;
}

export const useChatBubbleStore = create<BubbleState>()((set) => ({
    isOpen: false,
    isExpanded: false,
    conversationId: null,
    edge: 'bottom-left',

    openBubble: (conversationId) => set({ isOpen: true, isExpanded: true, conversationId }),

    closeBubble: () => set({ isOpen: false, isExpanded: false, conversationId: null }),

    toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

    setExpanded: (expanded) => set({ isExpanded: expanded }),

    setEdge: (edge) => set({ edge }),
}));
