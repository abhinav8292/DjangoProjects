from django.forms import ModelForm
from django import forms
from .models import *

class ListingsForm(ModelForm):
    class Meta:
        model = Listings
        exclude = ['is_active', 'Created', 'Creator']

        widgets = {
            'Title': forms.TextInput(attrs={'class': 'form-control'}),
            'Description': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'Category': forms.TextInput(attrs={'class': 'form-control'}),
            'Start_Bid': forms.NumberInput(attrs={'class': 'form-control'}),
            'Image_Url': forms.URLInput(attrs={'class': 'form-control'})
        }


class BidingsForm(ModelForm):
    class Meta:
        model = Bidings
        fields = ['Max_Bid']

        labels = {
            'Max_Bid': ''
        }

class CommentsForm(ModelForm):
    class Meta:
        model = Comments
        fields = ['Comment']

        labels = {
            'Comment': ''
        }


        widgets = {
            'Comment': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Add a public comment', 'rows': '2'})
        }