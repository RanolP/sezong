import { Message } from '../core';
import CompileFunction from './compile-function';
import {
  NormalText,
  ParagraphSplitBlock,
  Renderable,
  RenderableBlock
} from './renderable';
import { Renderer } from './renderer';

export class Platform<MidResult, Result> {
  public blockConstructors: Map<
    string,
    Renderer<unknown, MidResult>
  > = new Map();
  public decorators: Map<string, Renderer<unknown, MidResult>> = new Map();

  constructor(
    public readonly name: string,
    public readonly compose: (midResults: MidResult[]) => Result,
    public readonly renderNormalText: (text: NormalText) => MidResult,
    public readonly renderParagraphSplit: (
      paragraphSplit: ParagraphSplitBlock
    ) => MidResult
  ) {}

  public registerBlockConstructor(renderer: Renderer<unknown, MidResult>) {
    this.blockConstructors.set(
      `${renderer.target.namespace}:${renderer.target.name}`,
      renderer
    );
  }

  public registerBlockConstructors(
    renderers: Array<Renderer<unknown, MidResult>>
  ) {
    for (const renderer of renderers) {
      this.registerBlockConstructor(renderer);
    }
  }

  public registerDecorator(renderer: Renderer<unknown, MidResult>) {
    this.decorators.set(
      `${renderer.target.namespace}:${renderer.target.name}`,
      renderer
    );
  }

  public registerDecorators(renderers: Array<Renderer<unknown, MidResult>>) {
    for (const renderer of renderers) {
      this.registerDecorator(renderer);
    }
  }

  public render(
    renderable: Renderable<unknown>,
    compile: (source: string) => [Array<Renderable<unknown>>, Message[]]
  ): [MidResult, Message[]] {
    if (renderable instanceof ParagraphSplitBlock) {
      return [this.renderParagraphSplit(renderable), []];
    }
    if (renderable instanceof NormalText) {
      return [this.renderNormalText(renderable), []];
    }

    const renderer = (renderable instanceof RenderableBlock
      ? this.blockConstructors
      : this.decorators
    ).get(`${renderable.namespace}:${renderable.name}`);
    if (renderer) {
      const rendered = renderer.render(renderable.props, ((
        source: string | Renderable<unknown>,
        raw?: true
      ) => {
        if (typeof source === 'string' && raw) {
          return this.renderNormalText(new NormalText(source));
        }
        if (typeof source === 'string') {
          const [compiledRenderables, compileMessages] = compile(source);
          const results: MidResult[] = [];
          const renderMessages: Message[] = [];
          for (const compiledRenderable of compiledRenderables) {
            const [result, messages] = this.render(compiledRenderable, compile);
            results.push(result);
            renderMessages.push(...messages);
          }
          return {
            messages: compileMessages.concat(renderMessages),
            result: results
          };
        } else {
          const [compileRendered, messages] = this.render(source, compile);
          return { messages, result: [compileRendered] };
        }
      }) as CompileFunction<MidResult>);
      if (rendered instanceof Array) {
        return rendered;
      } else {
        return [rendered, []];
      }
    }

    throw new Error(
      `Unable to render ${renderable.debug()} on ${this.name} platform.`
    );
  }

  public renderAll(
    renderables: Array<Renderable<any>>,
    compile: (source: string) => [Array<Renderable<unknown>>, Message[]]
  ): [Result, Message[]] {
    const results: MidResult[] = [];
    const messages: Message[] = [];
    for (const renderable of renderables) {
      const [result, message] = this.render(renderable.props, compile);
      messages.push(...message);
      results.push(result);
    }

    return [this.compose(results), messages];
  }
}
