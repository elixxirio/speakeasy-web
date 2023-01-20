import type { Message } from 'src/types';

import React, { FC, HTMLAttributes } from 'react';
import cn from 'classnames';
import 'moment-timezone';
import moment from 'moment';
import DOMPurify from 'dompurify';
import Clamp from 'react-multiline-clamp';
import Identity from 'src/components/common/Identity';

import s from './ChatMessage.module.scss';
import ChatReactions from '../ChatReactions';
import { Pin } from '@components/icons';

const mapTextToHtmlWithAnchors = (text: string) => {
  const withLinks = text.replace(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    '<a target="_blank" rel="noopener noreferrer" href="$&">$&</a>'
  );

  const withBreaks = withLinks.replace(
    /\n/g, '<br />'
  )

  return DOMPurify.sanitize(withBreaks, {
    ALLOWED_TAGS: ['a', 'br'],
    ALLOWED_ATTR: ['target', 'href', 'rel']
  });
};

type Props = HTMLAttributes<HTMLDivElement> & {
  clamped: boolean;
  onEmojiReaction?: (emoji: string, messageId: string) => void;
  message: Message;
}

const ChatMessage: FC<Props> = (props) => {
  const { clamped, message } = props;
  return (
    <div
    {...props}
      className={cn(
        props.className,
        'flex items-center',
        s.root,
        {
          [s.root__withReply]: message.repliedTo !== null
        },
        props.className
      )}
      id={message.id}
    >

      <div className={cn('flex flex-col', s.messageWrapper)}>
        
        <div className={cn(s.header)}>
          {message.repliedTo !== null ? (
            <>
              <Identity {...message} />
              <span className={cn(s.separator, 'mx-1')}>replied to</span>

              {message.replyToMessage
                ? <Identity {...message.replyToMessage} />
                : <span className={cn(s.separator, '')}><strong>deleted/unknown</strong></span>}

            </>
          ) : (
            <Identity {...message} />
          )}

          <span className={cn(s.messageTimestamp)}>
            {moment(message.timestamp).format('hh:mm A')}
          </span>
          <a
            href={`https://dashboard.xx.network/rounds/${message.round}`}
            target='_blank'
            rel='noreferrer'
            className='text text--xs ml-2'
            style={{
              whiteSpace: 'nowrap',
              fontSize: '9px',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              marginBottom: '1px'
            }}
          >
            Show mix
          </a>
          {!clamped && message.pinned && (
            <Pin className='inline ml-2 h-3' />
          )}
        </div>

        <div className={cn(s.body)}>
          {message.repliedTo !== null && (
            <p
              className={cn(s.replyToMessageBody)}
              onClick={() => {
                if (message.replyToMessage) {
                  const originalMessage = document.getElementById(
                    message.replyToMessage.id || ''
                  );
                  if (originalMessage) {
                    originalMessage.scrollIntoView();
                    originalMessage.classList.add(s.root__highlighted);
                    setTimeout(() => {
                      originalMessage.classList.remove(s.root__highlighted);
                    }, 3000);
                  }
                }
              }}
            >
              {message.replyToMessage ? (
                <>
                  <Identity {...message.replyToMessage} />
                  <Clamp lines={3}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: mapTextToHtmlWithAnchors(message.replyToMessage.body)
                      }}
                    ></p>
                  </Clamp>
                </>
              ) : (
                <>This message is unknown/deleted</>
              )}
            </p>
          )}
          <Clamp
            showMoreElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                Show more
              </button>
            )}
            showLessElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                Show less
              </button>
            )}
            withToggle={clamped}
            lines={clamped ? 3 : Number.MAX_SAFE_INTEGER}>
            <p
              className={cn(s.messageBody, {
                [s.messageBody__failed]: message.status === 3
              })}
              dangerouslySetInnerHTML={{
                __html: mapTextToHtmlWithAnchors(message.body)
              }}
            />
          </Clamp>
        </div>
        <ChatReactions {...props} />
      </div>
    </div>
  );
};

export default ChatMessage;
