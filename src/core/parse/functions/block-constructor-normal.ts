import { TokenType } from '../../../api/token';
import CompilerConfiguration from '../../compiler-configuration';
import { ParseState } from '../parser-state';
import { Result } from '../types';
import { nextBlockConstructorTail } from './block-constructor-tail';
import nextNormalText from './normal-text';

export function nextNormalBlockConstructor(
  configuration: CompilerConfiguration,
  state: ParseState
): Result {
  if (!state.hasCurrent(TokenType.VerticalBar)) {
    return nextNormalText(state);
  }
  const tokens = [state.cursorNext()];
  tokens.push.apply(tokens, state.skipWhitespace());
  if (
    !state.hasCurrent(TokenType.NormalText) ||
    !(state.currentToken.source in configuration.blockConstructorNormalNames)
  ) {
    return nextNormalText(state, tokens);
  }
  tokens.push(state.cursorNext());

  return nextBlockConstructorTail(
    tokens,
    configuration.blockConstructorNormalNames[tokens.slice(-1)[0].source]
      .receiveDocument,
    state
  );
}
