<template>
  <div class="c-editor">
    <div id="editor"></div>
    <slot></slot>

    <ul
      v-if="mentionVisible"
      class="mention-dropdown"
      :style="{
        top: `${mentionPosition.top}px`,
        left: `${mentionPosition.left}px`,
      }"
    >
      <li
        v-for="user in mentionUsers"
        :key="user.uid"
        @click="handleInsertUser(user)"
      >
        {{ user.displayName }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    theme: {
      type: String,
      default: "snow",
    },
    placeholder: {
      type: String,
      default: null,
    },
    contents: {
      type: String,
      default: null,
    },
    modules: {
      type: Object,
      default: null,
    },
    users: {
      type: Array,
      default: null,
    },
  },

  data() {
    return {
      editor: null,
      mentionBlot: null,

      mentionUsers: null,
      mentionVisible: false,
      mentionPosition: {
        top: 0,
        left: 0,
      },
      mentionCurrentRange: null,
    }
  },

  async mounted() {
    await this.init()
    document.addEventListener("click", this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside)
  },
  beforeDestroy() {
    this.editor = null
    this.reset()
  },

  methods: {
    async init() {
      if (window.Quill) {
        let options = {
          theme: this.theme,
        }
        if (this.placeholder) {
          options.placeholder = this.placeholder
        }
        if (this.modules) {
          options.modules = this.modules
        }
        if (this.users) {
          // Mention Popover
          class UserMention {
            constructor(quill, options) {
              this.quill = quill
              this.options = options
              this.onKeyUp = this.onKeyUp.bind(this)
              this.quill.root.addEventListener("keyup", this.onKeyUp)
            }
            onKeyUp() {
              const range = this.quill.getSelection()
              if (!range) return

              const [line] = this.quill.getLine(range.index)
              const text = line.domNode.textContent
              const cursorPos = range.index - line.offset(this.quill.scroll)
              const match = /@(\w+)$/.exec(text.slice(0, cursorPos))

              if (match) {
                const keyword = match[1]
                const users = this.options.source(keyword)
                const bounds = this.quill.getBounds(range.index)
                this.options.onMentionTrigger(users, bounds, range)
              } else {
                this.options.onMentionCancel()
              }
            }
          }
          Quill.register("modules/userMention", UserMention)

          // Mention Blot
          const Inline = Quill.import("blots/inline")

          class MentionBlot extends Inline {
            static create(data) {
              const node = super.create()
              node.setAttribute("data-id", data.id)
              node.setAttribute("data-value", data.value)
              node.innerText = `@${data.value}`
              return node
            }

            static value(node) {
              return {
                id: node.getAttribute("data-id"),
                value: node.getAttribute("data-value"),
              }
            }
          }

          MentionBlot.blotName = "mentionUser"
          MentionBlot.tagName = "p"
          MentionBlot.className = "mentionUser"

          Quill.register(MentionBlot)

          options.modules = {
            userMention: {
              source: (searchTerm) => {
                return this.users.filter((user) =>
                  user.displayName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
              },
              onMentionTrigger: this.handleMentionTrigger,
              onMentionCancel: this.handleMentionCancel,
            },
          }
        }

        this.editor = new Quill("#editor", options)

        this.editor.on("text-change", () => {
          this.$emit("change", this.getContent())
        })

        if (this.contents) {
          setTimeout(() => {
            this.setContent(this.contents)
          }, 300)
        }
      }
    },
    reset() {
      if (this.editor) {
        this.editor.setContents([])
      }
    },
    getContent() {
      return this.editor.root.innerHTML
    },
    setContent(content) {
      this.editor.root.innerHTML = content
    },

    handleMentionTrigger(users, bounds, range) {
      this.mentionUsers = users
      this.mentionPosition = {
        top: bounds.bottom + window.scrollY + 30,
        left: bounds.left + window.scrollX - 20,
      }
      this.mentionVisible = true
      this.mentionCurrentRange = range
    },
    handleMentionCancel() {
      this.mentionVisible = false
    },
    handleInsertUser(user) {
      const quill = this.editor
      const quillText = quill.getText()
      const atIndex = quillText.lastIndexOf("@")

      this.mentionVisible = false
      this.mentionPosition = {
        top: 0,
        left: 0,
      }
      this.mentionCurrentRange = null

      if (atIndex !== -1) {
        const totalLength = quill.getLength()
        const deleteLength = totalLength - atIndex
        const startIndex = atIndex
        const userData = { id: user.uid, value: user.displayName }

        quill.deleteText(startIndex, deleteLength)
        quill.insertEmbed(startIndex, "mentionUser", userData)
        quill.insertText(startIndex + user.displayName.length + 2, " ")
        quill.setSelection(startIndex + user.displayName.length + 2)

        console.log("Mention User ::: ", user.displayName)
      }
    },
    handleClickOutside(event) {
      if (this.mentionVisible) {
        this.mentionVisible = false
      }
    },
  },
}
</script>
