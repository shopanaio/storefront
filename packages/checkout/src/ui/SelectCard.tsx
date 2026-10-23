import { Button } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { OptionWave } from './OptionWave';
import { mq, VisuallyHidden } from '@shopana/storefront-ui';
import { selectedDeclarations } from './selected';

/**
 * A value of the form shown as a card that opens its editor (the contact, the recipient, the
 * city): an icon, what is filled in, and on the right the action, a primary text button with a
 * chevron. The whole card opens the editor; the action is the one control, named by the field,
 * the value and the action, so assistive technology reads it as before.
 */
export function SelectCard({
  label,
  labelShown = false,
  icon,
  selected,
  action,
  onClick,
  disabled = false,
  className,
  children,
}: {
  /** Name of the field (Contact, Recipient, City), the start of the control's name. */
  label: ReactNode;
  /** Whether `children` already show the label, so it is not read twice. */
  labelShown?: boolean;
  icon?: ReactNode;
  /** A value is filled in: the card takes the look of a chosen option. */
  selected: boolean;
  /** Text of the action: change when a value is filled in, select when not. */
  action: string;
  onClick: () => void;
  /** Nothing to choose from yet (no city for a branch): the card does not open. */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { styles } = useStyles();
  const labelId = useId();
  const contentId = useId();
  const actionId = useId();

  return (
    <OptionWave disabled={disabled}>
      <div
        className={clsx(
          styles.card,
          selected && styles.selected,
          disabled && styles.disabled,
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {labelShown ? null : (
          <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
        )}
        <div id={contentId} className={styles.content}>
          {children}
        </div>
        <Button
          variant="text"
          color="primary"
          icon={
            <LuChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          }
          iconPlacement="end"
          className={styles.action}
          disabled={disabled}
          aria-labelledby={[labelShown ? null : labelId, contentId, actionId]
            .filter(Boolean)
            .join(' ')}
          onClick={(event) => {
            // The card opens the editor; the click is not counted twice.
            event.stopPropagation();
            onClick();
          }}
        >
          <span id={actionId} className={styles.actionText}>
            {action}
          </span>
        </Button>
      </div>
    </OptionWave>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    min-height: 64px;
    padding: ${token.paddingXXS}px ${token.paddingXS}px ${token.paddingXXS}px
      ${token.paddingSM}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    cursor: pointer;
    transition: border-color ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimaryHover};
    }
  `,
  selected: css`
    ${selectedDeclarations(token)}
  `,
  disabled: css`
    cursor: not-allowed;
    background: ${token.colorBgContainerDisabled};

    &:hover {
      border-color: ${token.colorBorder};
    }
  `,
  icon: css`
    display: flex;
    flex-shrink: 0;
  `,
  content: css`
    flex: 1;
    min-width: 0;
  `,
  action: css`
    flex-shrink: 0;
    gap: ${token.marginXXS}px;
    padding-inline: ${token.paddingXS}px;

    /* The chevron is drawn in the middle of its box: its empty right side would make the padding
       on the right look wider than on the left. It sits a pixel lower, at the middle of the
       lowercase letters rather than of the line. */
    & .ant-btn-icon {
      display: flex;
      margin-inline: 0 -7px;
      transform: translateY(1px);
    }

    /* On a phone the chevron alone: the whole card is the target there. */
    ${mq.max.md} {
      gap: 0;
      padding-inline: ${token.paddingXXS}px;

      & .ant-btn-icon {
        margin-inline: 0;
        transform: none;
      }
    }
  `,
  // Read out everywhere, shown from the tablet up.
  actionText: css`
    ${mq.max.md} {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,
}));
