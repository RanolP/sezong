import { AnyBlockConstructor, AnyDecorator } from '../api/rule';
import ParserConfiguration from './parse/parser-configuration';

export default class CompilerConfiguration {
  public readonly decorators: AnyDecorator[];
  public readonly blockConstructors: AnyBlockConstructor[];
  public readonly parserConfiguration: ParserConfiguration;

  constructor(
    decorators: AnyDecorator[],
    blockConstructors: AnyBlockConstructor[]
  ) {
    this.decorators = decorators;
    this.blockConstructors = blockConstructors;
    this.parserConfiguration = new ParserConfiguration(
      decorators,
      blockConstructors
    );
  }
}
