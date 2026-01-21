#include <bits/stdc++.h>
using namespace std;

class Node {
public:
    int val;
    Node* next;

    Node(int val) {
        this->val = val;
        this->next = NULL;
    }
};

void insertAtBeginning(Node*& head, int n) {
    Node* newNode = new Node(n);
    newNode->next = head;
    head = newNode;
}

void displayNode(Node* head) {
    Node* temp = head;
    cout << "Linked List: ";
    while (temp != NULL) {
        cout << temp->val << " ";
        temp = temp->next;
    }
    cout << endl;
}

int main() {
    Node* head = NULL;
    int n, choice;

    while (true) {
        cin >> n;
        cin >> choice;
        insertAtBeginning(head, n);

        if (choice == 1) {
            break;
        }
    }

    displayNode(head);
    return 0;
}
