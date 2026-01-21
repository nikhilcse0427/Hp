#include <bits/stdc++.h>
using namespace std;

int main() {
    string str = "nfknfrkvnkf kdjv, kjfjnefklne"; 
    int i = 0, j = str.length() - 1;

    while (i < j) {
        while (i < j && !isalnum(str[i])) i++;

        while (i < j && !isalnum(str[j])) j--;

        if (tolower(str[i]) != tolower(str[j])) {
            cout << str << " is not a palindrome";
            return 0;
        }
        i++;
        j--;
    }
    cout << str << " is a palindrome";
    return 0;
}
