import { Input as AntdInput, InputProps as AntdInputProps, Tooltip } from 'antd';
interface InputProps extends AntdInputProps {
  disabledHint?: string;
  successHint?: string;
}
export function CustomInput({ disabledHint, successHint, ...props }: InputProps) {
  if (disabledHint && props.disabled) {
    return (
      <Tooltip title={disabledHint}>
        <AntdInput {...props} />
      </Tooltip>
    );
  }

  if (successHint && !props.disabled) {
    return (
      <Tooltip title={successHint}>
        <AntdInput {...props} />
      </Tooltip>
    );
  }

  return <AntdInput {...props} />;
}
