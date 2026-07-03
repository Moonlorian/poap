import { MvxCopyButton } from '@/lib/sdkDappUI';

export const CopyButton = ({
  className,
  text,
  copyIcon,
  iconClass,
  successIcon
}) => {
  return (
    <MvxCopyButton
      class={className}
      text={text}
      copyIcon={copyIcon}
      iconClass={iconClass}
      successIcon={successIcon}
    />
  );
};
