import { RenderableInline, RenderableText } from '../../api/renderable';
import { Decorator } from '../../api/rule';

export const UnderlineRule: Decorator<UnderlineText> = {
  compile(input: RenderableInline): UnderlineText {
    return new UnderlineText(input);
  },
  name: 'underline',
  namespace: 'std'
};

export class UnderlineText extends RenderableText {
  constructor(data: RenderableInline) {
    super(data);
  }

  public debug(): string {
    return `Underline(${this.data.debug()})`;
  }
}
