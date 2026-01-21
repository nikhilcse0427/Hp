// create a samo=ple linkedlist and check whether cycle is there or not
// if cycle is presrent, find the length of the cycle

#include<bits/stdc++.h>
using namespace std;

class Node{
  public:
    int val;
    Node* next;
  Node(int val){
    this->val = val;
    this->next = NULL;
  }
};

bool detectCycle(Node* head){
  Node* slow = head;
  Node* fast = head;
  while(fast->next != NULL && fast->next->next != NULL){
    if(slow == fast) return true;
    slow = slow->next;
    fast = fast->next->next;
  }
  return false;
}

int main(){
  Node* head = new Node(10);
  head->next = new Node(20);
  head->next->next = new Node(30);
  head->next->next->next = new Node(40);
  head->next->next->next->next = new Node(50);
  head->next->next->next->next->next = head->next;

  if(detectCycle(head)){
    cout<<"cycle is there";
  }else{
    cout<<"cycle is not there";
  }
  return 0;
}