import { FormatAmountController, useGetNetworkConfig } from '@/lib/sdkDapp';
import { MvxFormatAmount } from '@/lib/sdkDappUI';
import { DECIMALS, DIGITS } from '@/lib/sdkDappUtils';

export const FormatAmount = (props) => {
  const { network } = useGetNetworkConfig();
  const egldLabel = network?.egldLabel || 'EGLD';

  const { isValid, valueDecimal, valueInteger, label } =
    FormatAmountController.getData({
      digits: DIGITS,
      decimals: DECIMALS,
      egldLabel,
      ...props,
      input: props.value
    });

  return (
    <MvxFormatAmount
      className={props.className}
      data-testid={props['data-testid']}
      isValid={isValid}
      label={label}
      showLabel
      valueDecimal={valueDecimal}
      valueInteger={valueInteger}
    />
  );
};
