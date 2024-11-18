import { Select as AntdSelect, SelectProps as AntdSelectProps, Tooltip } from 'antd';
interface SelectProps extends AntdSelectProps {
  disabledHint?: string;
}
export function CustomSelect({ disabledHint, ...props }: SelectProps) {
  if (disabledHint) {
    return (
      <Tooltip title={props.disabled ? disabledHint : ''}>
        <AntdSelect {...props} />
      </Tooltip>
    );
  }
  return <AntdSelect {...props} />;
}
