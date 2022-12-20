
import type { Message } from '@types';
import type { FC, HTMLAttributes } from 'react';

import React, { useCallback, useMemo } from 'react';
import moment from 'moment';
import _ from 'lodash';
import cn from 'classnames';

import MessageContainer from '../MessageContainer';
import { Spinner } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { byEntryTimestamp } from 'src/utils/index';
import { useUI } from '@contexts/ui-context';

import s from './MessagesContainer.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  messages: Message[];
  handleReplyToMessage: (message: Message) => void;
}

const MessagesContainer: FC<Props> = ({ handleReplyToMessage, messages, ...props }) => {
  const { cmix, currentChannel, sendReaction } = useNetworkClient();
  const { openModal, setModalView } = useUI();
  
  const sortedGroupedMessagesPerDay = useMemo(() => {
    const groupedMessagesPerDay = _.groupBy(
      messages,
      (message) => moment(
        moment(message.timestamp),
        'DD/MM/YYYY'
      ).startOf('day')
    );

    return Object.entries(groupedMessagesPerDay)
      .sort(byEntryTimestamp);
  }, [messages]);


  const onEmojiReaction = useCallback((emoji: string, messageId: string) =>  {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      sendReaction(emoji, messageId);
    }
  }, [cmix, openModal, sendReaction, setModalView]);

  return (
    <div {...props}>
      {!currentChannel || currentChannel.isLoading ? (
        <div className='m-auto flex w-full h-full justify-center items-center'>
          <Spinner />
        </div>
      ) : (
        <>
        {sortedGroupedMessagesPerDay.map(([key, message]) => {
          return (
            <div className={cn(s.dayMessagesWrapper)} key={key}>
              <div className={s.separator}></div>
              <span className={cn(s.currentDay)}>
                {moment(key).format('dddd MMMM Do, YYYY')}
              </span>
              {message.map((m) => (
                <MessageContainer
                  onEmojiReaction={onEmojiReaction}
                  handleReplyToMessage={handleReplyToMessage}
                  message={m} />
              ))}
            </div>
          );
        })}
        </>
      )}
    </div>
  );
}

export default MessagesContainer;