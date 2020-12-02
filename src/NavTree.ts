import NavTreeNode, { NavItemTypes, Offset } from './NavTreeNode'
import { INavTreeKeyPressObservable } from './observers/NavTreeKeyPressObserver'
import { INavTreeHtmlObservable } from './observers/NavTreeHtmlObserver'
import { INavTreeClickObservable } from './observers/NavTreeClickObserver'

export default class NavTree implements INavTreeHtmlObservable,
                                        INavTreeKeyPressObservable,
                                        INavTreeClickObservable {
  public elem: HTMLElement
  public rootNode: NavTreeNode
  public nodeMapByUuid: Record<string, NavTreeNode> = {}
  public nodeMapByLabel: Record<string, NavTreeNode> = {}
  public activeNode: NavTreeNode | null = null

  constructor(elem: HTMLElement) {
    this.elem = elem
    this.rootNode = new NavTreeNode(elem)
    this.parseHtml(elem, this.rootNode)
    this.activateNode(this.rootNode)
  }

  protected parseHtml(elem: HTMLElement, parent: NavTreeNode): void {
    for (let index = 0; index < elem.children.length; index += 1) {

      const childElem = elem.children[index] as HTMLElement
      if (NavTreeNode.hasNavTypeAttribute(childElem)) {
        const childNode = new NavTreeNode(childElem, parent)
        this.registerNode(childNode)

        if (childNode.type !== NavItemTypes.Item) {
          this.parseHtml(childElem, childNode)
        }
      } else {
        this.parseHtml(childElem, parent)
      }
    }
  }

  protected registerNode(node: NavTreeNode): void {
    this.nodeMapByUuid[node.uuid] = node

    if (node.label) {
      this.nodeMapByLabel[node.label] = node
    }
  }

  public build(): void {
    const prevActiveNavItemUuid = this.activeNode?.uuid as string
    this.nodeMapByUuid = {}
    this.nodeMapByLabel = {}
    this.rootNode = new NavTreeNode(this.elem)
    this.deactivateNode()
    this.parseHtml(this.elem, this.rootNode)

    if (this.nodeMapByUuid[prevActiveNavItemUuid]) {
      this.activateNodeByUuid(prevActiveNavItemUuid)
    } else {
      this.activateNode(this.rootNode)
    }
  }

  public activateNodeByLabel(key: string): void {
    const node = this.nodeMapByLabel[key]
    this.activateNode(node)
  }

  public activateNodeByUuid(key: string): void {
    const node = this.nodeMapByUuid[key]
    this.activateNode(node)
  }

  public activateNode(node: NavTreeNode | null): void {
    if (!node || node.uuid === this.activeNode?.uuid) {
      return
    }

    if (node.hasType(NavItemTypes.Item)) {
      this.activeNode?.deactivate()
      this.activeNode = node
      this.activeNode?.activate()
    } else {
      const childNode = node.getFirstChildNode()
      this.activateNode(childNode)
    }
  }

  public deactivateNode(): void {
    this.activeNode?.deactivate()
    this.activeNode = null
  }

  protected move(node: NavTreeNode | null, type: NavItemTypes, offset: number): void {
    if (!node || !node.parent) {
      return
    }

    const parentNode = node.parent
    const nextNode = parentNode.getChildNode(node.index + offset)
    if (parentNode.hasType(type) && nextNode) {
      this.activateNode(nextNode)
    } else {
      this.move(parentNode, type, offset)
    }
  }

  public up(): void {
    this.move(this.activeNode, NavItemTypes.Row, Offset.Prev)
  }

  public down(): void {
    this.move(this.activeNode, NavItemTypes.Row, Offset.Next)
  }

  public left(): void {
    this.move(this.activeNode, NavItemTypes.Column, Offset.Prev)
  }

  public right(): void {
    this.move(this.activeNode, NavItemTypes.Column, Offset.Next)
  }
}
