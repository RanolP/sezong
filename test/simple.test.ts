import { NodeType } from '../src/api/node';
import CompilerConfiguration from '../src/core/compiler-configuration';
import { MessageType } from '../src/core/message';
import { Parser } from '../src/core/parse/parser';
import tokenize from '../src/core/tokenize/tokenizer';
import { Header1Rule } from '../src/std/block-constructor/header1.rule';
import { YoutubeRule } from '../src/std/block-constructor/youtube.rule';
import { BoldRule } from '../src/std/decorator/bold.rule';
import { ItalicRule } from '../src/std/decorator/italic.rule';
import { LinkRule } from '../src/std/decorator/link.rule';
import { StrikethroughRule } from '../src/std/decorator/strikethrough.rule';
import { UnderlineRule } from '../src/std/decorator/underline.rule';

const decorators = [
  BoldRule,
  ItalicRule,
  LinkRule,
  StrikethroughRule,
  UnderlineRule
];
const blockConstructors = [Header1Rule, YoutubeRule];

const configuration = new CompilerConfiguration(decorators, blockConstructors);

const createParser = (source: string) =>
  new Parser(configuration, tokenize(source));

describe('decorators', () => {
  it('bold', () => {
    const source = "[Text 'bold]";
    const node = createParser(source).nextNode();
    expect(node).not.toBe(null);
    expect(node!.type).toBe(NodeType.Decorator);
  });

  it('unknown', () => {
    const source = "[Text 'unknownDecorator]";
    const parser = createParser(source);
    const node = parser.nextNode();
    expect(node).not.toBe(null);
    expect(node!.type).toBe(NodeType.Decorator);
    expect(parser.state.messages.length).toBe(1);
    expect(parser.state.messages[0].type).toBe(MessageType.Warning);
  });
});
