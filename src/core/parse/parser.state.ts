import { Token, TokenType } from '../../api/token';
import { Message } from '../message';
import {
  CurrentTokenCondition,
  PrevCurrentTokenCondition,
  TokenCondition
} from './types';

export class ParseState {
  public readonly tokens: Token[];
  public readonly messages: Message[] = [];
  private index: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public cursorNext(): Token {
    const current = this.currentToken;
    this.index++;
    return current;
  }

  public get hasPrev(): boolean {
    return 0 < this.index;
  }

  public hasCurrent(type?: TokenType): boolean {
    return (
      this.index < this.tokens.length &&
      (type === undefined || this.currentToken.type === type)
    );
  }

  public get hasNext(): boolean {
    return this.index + 1 < this.tokens.length;
  }

  public get prevToken(): Token {
    return this.tokens[this.index - 1];
  }

  public get currentToken(): Token {
    return this.tokens[this.index];
  }

  public skipWhitespace(andLinefeed: boolean = false): Token[] {
    return this.until(
      (token: Token) =>
        token.type === TokenType.WhiteSpace ||
        (andLinefeed && token.type === TokenType.LineFeed)
    );
  }

  public until(condition: TokenCondition, eatLast: boolean = false): Token[] {
    const result: Token[] = [];
    if (!this.hasCurrent()) {
      return result;
    }
    while (this.checkCondition(condition) && this.hasNext) {
      result.push(this.cursorNext());
    }
    if (eatLast) {
      result.push(this.cursorNext());
    }
    return result;
  }

  public checkCondition(condition: TokenCondition): boolean {
    switch (condition.length) {
      case 1: {
        return (condition as CurrentTokenCondition)(this.currentToken);
      }
      case 2: {
        return (condition as PrevCurrentTokenCondition)(
          this.hasPrev ? this.prevToken : null,
          this.currentToken
        );
      }
      default: {
        return false;
      }
    }
  }
}
