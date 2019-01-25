import {
  AnyBlockConstructor,
  AnyDecorator,
  BlockConstructor,
  Decorator,
  Node,
  Platform,
  Renderable,
  RenderableBlock,
  RenderableInline,
  Renderer,
  Token
} from '../api';
import {
  CompilerConfiguration,
  link,
  Message,
  Parser,
  render,
  tokenize
} from '../core';
import { renderAll } from './link/renderer';

export default class Compiler<ResultType, MidResultType> {
  private modified = false;
  private decorators = new Set<AnyDecorator>();
  private blockConstructors = new Set<AnyBlockConstructor>();
  private configuration: CompilerConfiguration = new CompilerConfiguration(
    [...this.decorators],
    [...this.blockConstructors]
  );

  constructor(private readonly platform: Platform<ResultType, MidResultType>) {}

  public addDecorator<RenderableType extends RenderableInline>(
    rule: Decorator<RenderableType>,
    renderer: Renderer<RenderableType, MidResultType>
  ) {
    this.decorators.add(rule);
    this.platform.renderers.add(renderer);
    this.modified = true;
  }

  public addBlockConstructor<RenderableType extends RenderableBlock>(
    rule: BlockConstructor<RenderableType>,
    renderer: Renderer<RenderableType, MidResultType>
  ) {
    this.blockConstructors.add(rule);
    this.platform.renderers.add(renderer);
    this.modified = true;
  }

  public tokenize(source: string | TemplateStringsArray): Token[] {
    return tokenize(source);
  }

  public parse(tokens: Token[]): [Node[], Message[]] {
    const parser = new Parser(this.updateConfiguration(), tokens);
    return [parser.parse(), parser.state.messages];
  }

  public link(nodes: Node[]): [Renderable[], Message[]] {
    return link(this.updateConfiguration(), nodes);
  }

  public render(renderables: Renderable[]): MidResultType[] {
    return render(this.platform, renderables);
  }

  public renderAll(renderables: Renderable[]): ResultType {
    return renderAll(this.platform, renderables);
  }

  public compile(
    source: string | TemplateStringsArray
  ): [ResultType, Message[]] {
    const tokens = this.tokenize(source);
    const [nodes, parseMessages] = this.parse(tokens);
    const [renderables, linkMessages] = this.link(nodes);
    const rendered = this.renderAll(renderables);

    return [rendered, parseMessages.concat(linkMessages)];
  }

  private updateConfiguration(): CompilerConfiguration {
    if (!this.modified) {
      return this.configuration;
    }
    this.modified = false;
    return (this.configuration = new CompilerConfiguration(
      [...this.decorators],
      [...this.blockConstructors]
    ));
  }
}
