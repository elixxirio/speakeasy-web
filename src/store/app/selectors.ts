import type { RootState } from 'src/store/types';
import type { ChannelId } from '../channels/types';

export const contributorsSearch = (state: RootState) => state.app.contributorsSearch;
export const channelsSearch = (state: RootState) => state.app.channelsSearch;
export const dmsSearch = (state: RootState) => state.app.dmsSearch ?? '';
export const currentDrawerUserPubkey = (state: RootState) => state.app.selectedUserPubkey;
export const messageDraft = (channelId?: ChannelId) => (state: RootState) => (channelId && state.app.messageDraftsByChannelId[channelId]) ?? '';
export const channelFavorites = (state: RootState) => state.app.channelFavorites;
export const isChannelFavorited = (channelId?: ChannelId) => (state: RootState) => state.app.channelFavorites.includes(channelId ?? '');
export const currentChannelOrConversationId = (state: RootState) => state.app.selectedChannelIdOrConversationId;
export const missedMessages = (state: RootState) => state.app.missedMessages;
export const replyingToId = (state: RootState) => state.app.replyingToMessageId;
export const highlighted = (messageId: string) => (state: RootState) => state.app.highlightedMessageId === messageId;
