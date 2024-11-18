import { Button as AntdButton, ButtonProps as AntdButtonProps, Tooltip } from 'antd';
interface ButtonProps extends AntdButtonProps {
  disabledHint?: string;
  successHint?: string;
}
export function CustomButton({ disabledHint, successHint, ...props }: ButtonProps) {
  const style = {
    backgroundColor:
      !props.danger && !props.disabled && props.type === 'primary' ? '#ffaf38' : undefined,
    color: !props.danger && !props.disabled && props.type === 'primary' ? '#000000' : undefined,
  };

  if (disabledHint && props.disabled) {
    return (
      <Tooltip title={props.disabled ? disabledHint : ''}>
        <AntdButton {...props} style={{ ...props.style, ...style }} />
      </Tooltip>
    );
  }

  if (successHint && !props.disabled) {
    return (
      <Tooltip title={successHint}>
        <AntdButton {...props} style={{ ...props.style, ...style }} />
      </Tooltip>
    );
  }

  return <AntdButton {...props} style={{ ...props.style, ...style }} />;
}
